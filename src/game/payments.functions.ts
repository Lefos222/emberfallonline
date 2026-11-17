import {createServerFn} from '@tanstack/react-start';
import {getRequest} from '@tanstack/react-start/server';
import z from 'zod';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {createStripeClient,getStripeErrorMessage} from '@/lib/stripe.server';
import {cardProduct,deliverSession,resolveOrCreateCustomer,paymentWebhook} from './payment-delivery.server';
import {applyDiamondSpend} from './premium-ledger';
import {CARD_PAYMENTS_FLAG,CARD_PAYMENTS_PAUSED_MESSAGE,cardPaymentsEnabledFrom} from './payments-switch';
import type {Hero} from './data';
export const paymentStatus=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async()=>({configured: Boolean(process.env['STRIPE_SANDBOX_API_KEY'] || process.env['STRIPE_LIVE_API_KEY']),cardPayments: cardPaymentsEnabledFrom(process.env[CARD_PAYMENTS_FLAG])}));
export const startCheckout=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({kind:z.enum(['diamonds','vip']),itemId:z.string().min(1).max(40),heroId:z.string().uuid(),environment:z.enum(['sandbox','live'])}).parse(input)).handler(async({data,context})=>{
 // No card purchase can be opened while the switch is off, whatever the client asks for.
 if(!cardPaymentsEnabledFrom(process.env[CARD_PAYMENTS_FLAG])) return {error:CARD_PAYMENTS_PAUSED_MESSAGE};
 try {
  const {data:hero,error}=await context.supabase.from('heroes').select('id').eq('id',data.heroId).maybeSingle();
  if(error || !hero) throw new Error('Select your character before buying.');
  const product=cardProduct(data.kind,data.itemId);
  const stripe=createStripeClient(data.environment);
  const prices=await stripe.prices.list({lookup_keys:[`emberfall_${data.kind}_${data.itemId}`],active:true,limit:1});
  const price=prices.data[0]; if(!price || price.unit_amount!==product.cents || price.currency!=='usd') throw new Error('This product price is not ready.');
  const stripeProduct=await stripe.products.retrieve(typeof price.product==='string'?price.product:price.product.id);
  const {data:{user}}=await context.supabase.auth.getUser();
  const customer=await resolveOrCreateCustomer(stripe,{userId:context.userId,email:user?.email});
  const origin=new URL(getRequest().url).origin;
  const session=await stripe.checkout.sessions.create({ui_mode:'embedded_page',mode:'payment',customer,line_items:[{price:price.id,quantity:1}],return_url:`${origin}/play?checkout=success&session_id={CHECKOUT_SESSION_ID}`,payment_intent_data:{description:stripeProduct.name},managed_payments:{enabled:true},metadata:{userId:context.userId,heroId:data.heroId,kind:data.kind,itemId:data.itemId,managed_payments:'true'}} as import('stripe').default.Checkout.SessionCreateParams);
  const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
  const {error:orderError}=await admin.from('payment_orders').insert({environment:data.environment,session_id:session.id,user_id:context.userId,hero_id:data.heroId,kind:data.kind,item_id:data.itemId,amount_cents:product.cents,diamonds:product.diamonds,vip_level:product.vipLevel});
  if(orderError) {await stripe.checkout.sessions.expire(session.id); throw new Error('The order could not be saved; nothing was charged.');}
  if(!session.client_secret) throw new Error('Payment form is not ready.');
  return {clientSecret:session.client_secret,sessionId:session.id};
 } catch(error) { return {error:getStripeErrorMessage(error)}; }
});
export const confirmCheckout=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({sessionId:z.string().min(4).max(200),environment:z.enum(['sandbox','live'])}).parse(input)).handler(async({data,context})=>{
 try {return await deliverSession(data.sessionId,data.environment,context.userId);} catch(error) {return {error:getStripeErrorMessage(error)};}
});
export const pendingCheckouts=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({environment:z.enum(['sandbox','live'])}).parse(input)).handler(async({data,context})=>{
 const {data:rows,error}=await context.supabase.from('payment_orders').select('session_id,hero_id').eq('environment',data.environment).eq('user_id',context.userId).eq('status','pending').order('created_at',{ascending:false}).limit(20);
 if(error) return {error:error.message}; return {orders:rows ?? []};
});
export const spendDiamonds=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(input=>z.object({kind:z.enum(['material','gem','chest','gold','vip','item']),itemId:z.string().min(1).max(60),qty:z.number().int().min(1).max(999).optional(),requestId:z.string().uuid(),heroId:z.string().uuid()}).parse(input)).handler(async({data,context})=>{
 try {
  const {data:row,error}=await context.supabase.from('heroes').select('save').eq('id',data.heroId).maybeSingle();
  if(error || !row) throw new Error('Select your character before buying.');
  const save=row.save as unknown as Hero;
  const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
  const item=`${data.kind}:${data.itemId}:${data.qty ?? 1}`;
  const {data:old}=await context.supabase.from('purchases').select('hero_id,item').eq('request_id',data.requestId).maybeSingle();
  if(old) {if(old.hero_id!==data.heroId || old.item!==item) throw new Error('Request belongs to another purchase'); return {save,already:true};}
  const next=applyDiamondSpend(save,{kind:data.kind,itemId:data.itemId,qty:data.qty},data.requestId);
  const price=(save.srv?.premium?.balance ?? 0)-(next.srv?.premium?.balance ?? 0);
  const {data:result,error:commitError}=await admin.rpc('premium_commit_spend',{_hero:data.heroId,_owner:context.userId,_req:data.requestId,_before:save as never,_after:next as never,_price:price,_item:item});
  if(commitError) throw new Error(commitError.message);
  return result as unknown as {save:Hero;already:boolean};
 } catch(error) {return {error:error instanceof Error?error.message:'The purchase could not be completed.'};}
});
// The public route invokes the handler in-process, never through a server-function RPC stub.
export {paymentWebhook};
