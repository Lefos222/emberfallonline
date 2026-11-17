import type Stripe from 'stripe';
import { createStripeClient, type StripeEnv } from '@/lib/stripe.server';
import { DIAMOND_PACKS, VIP_PLANS, diamondPackTotal } from './economy';
export async function deliverSession(id: string, env: StripeEnv, userId?: string) {
 const stripe=createStripeClient(env);
 const session=await stripe.checkout.sessions.retrieve(id);
 const { supabaseAdmin: admin }=await import('@/integrations/supabase/client.server');
 const {data: order,error}=await admin.from('payment_orders').select('*').eq('environment',env).eq('session_id',id).single();
 if(error || !order) throw new Error('Payment order not found.');
 if(userId && order.user_id!==userId) throw new Error('This purchase belongs to another account.');
 if(session.metadata?.['userId']!==order.user_id || session.metadata?.['heroId']!==order.hero_id || session.livemode!==(env==='live')) throw new Error('Payment ownership mismatch.');
 if(session.payment_status!=='paid' || session.status!=='complete') throw new Error('Payment is still pending. No goods have been delivered.');
 const lines=await stripe.checkout.sessions.listLineItems(id,{limit:2});
 const line=lines.data[0];
 if(lines.data.length!==1 || line.quantity!==1 || line.price?.currency!==order.currency || line.price.unit_amount!==order.amount_cents || line.price.lookup_key!==`emberfall_${order.kind}_${order.item_id}`) throw new Error('The payment does not match the order.');
 const {data: value,error: deliveryError}=await admin.rpc('payment_deliver',{_env:env,_session:id,_paid_at:new Date().toISOString()});
 if(deliveryError) throw new Error(deliveryError.message);
 return value as unknown as {save: import('./data').Hero; already:boolean; test:boolean};
}
export function cardProduct(kind:'diamonds'|'vip',id:string) {
 if(kind==='diamonds') { const pack=DIAMOND_PACKS.find(p=>p.id===id); if(!pack) throw new Error('Unknown Diamond pack.'); return {cents:pack.priceCents,diamonds:diamondPackTotal(pack),vipLevel:0}; }
 const plan=VIP_PLANS.find(p=>String(p.level)===id); if(!plan) throw new Error('Unknown VIP membership.');
 return {cents:plan.priceCents,diamonds:0,vipLevel:plan.level};
}
// Customer lookup follows the integration's identity-aware shared pattern.
export async function resolveOrCreateCustomer(stripe: ReturnType<typeof createStripeClient>, options: {email?:string;userId?:string}): Promise<string> {
 if(options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error('Invalid userId');
 if(options.userId) { const found=await stripe.customers.search({query:`metadata['userId']:'${options.userId}'`,limit:1}); if(found.data.length) return found.data[0].id; }
 if(options.email) { const existing=await stripe.customers.list({email:options.email,limit:1}); if(existing.data.length) { const customer=existing.data[0]; if(options.userId && customer.metadata?.['userId']!==options.userId) await stripe.customers.update(customer.id,{metadata:{...customer.metadata,userId:options.userId}}); return customer.id; } }
 const created=await stripe.customers.create({...options.email && {email:options.email},...options.userId && {metadata:{userId:options.userId}}}); return created.id;
}
export async function paymentWebhook(request:Request,env:StripeEnv) {
 const sig=request.headers.get('stripe-signature'); const body=await request.text();
 const secret=process.env[env==='sandbox'?'PAYMENTS_SANDBOX_WEBHOOK_SECRET':'PAYMENTS_LIVE_WEBHOOK_SECRET'];
 if(!sig || !secret) throw new Error('Invalid webhook signature');
 const stripe=createStripeClient(env);
 const event=await stripe.webhooks.constructEventAsync(body,sig,secret,300);
 if(event.livemode!==(env==='live')) throw new Error('Invalid payment environment');
 if(event.type==='checkout.session.completed' || event.type==='checkout.session.async_payment_succeeded') {
  const session=event.data.object as Stripe.Checkout.Session;
  if(session.payment_status==='paid') await deliverSession(session.id,env);
 } else if(event.type==='checkout.session.expired' || event.type==='checkout.session.async_payment_failed') {
  const session=event.data.object as Stripe.Checkout.Session;
  const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
  const {error}=await admin.from('payment_orders').update({status:event.type==='checkout.session.expired'?'expired':'failed'}).eq('environment',env).eq('session_id',session.id).is('delivered_at',null);
  if(error) throw new Error('Could not record payment status');
 }
}
