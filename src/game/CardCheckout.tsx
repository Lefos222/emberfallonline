import {useMemo,useState} from 'react';
import {EmbeddedCheckoutProvider,EmbeddedCheckout} from '@stripe/react-stripe-js';
import {getStripe,getStripeEnvironment} from '@/lib/stripe';
import {confirmCardPurchase} from './premium-shop';
import {Button} from '@/components/ui/button';
import {tr} from './i18n';
export function PaymentTestModeBanner() {
 const token=import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'];
 if(token?.startsWith('pk_live_')) return null;
 return <p role="status" className="mb-3 border border-gold/40 bg-gold/10 p-3 text-sm text-gold">{tr(token?.startsWith('pk_test_')?'Test payments only — no real charges or game rewards.':'Live payments are not open yet.')}</p>;
}
export function CardCheckout({session,onClose}:{session:{clientSecret:string;sessionId:string};onClose:()=>void}) {
 const [notice,setNotice]=useState('');
 const stripe=useMemo(()=>getStripe(),[]);
 const options=useMemo(()=>({clientSecret:session.clientSecret,onComplete:()=>{void confirmCardPurchase(session.sessionId).then(result=>setNotice(result.test?tr('Test purchase verified. Your real game balance is unchanged.'):tr('Payment confirmed — your purchase is in your account.')),error=>setNotice(error instanceof Error?error.message:'Payment pending'));}}),[session]);
 return <section className="w-full"><div className="mb-3 flex justify-end"><Button variant="outline" onClick={onClose}>{tr('Close')}</Button></div>{notice?<p role="status" className="border border-gold/40 p-4 text-gold">{notice}</p>:<EmbeddedCheckoutProvider stripe={stripe} options={options}><EmbeddedCheckout /></EmbeddedCheckoutProvider>}<Button className="mt-3" variant="outline" onClick={()=>void confirmCardPurchase(session.sessionId).then(result=>setNotice(result.test?tr('Test purchase verified. Your real game balance is unchanged.'):tr('Payment confirmed — your purchase is in your account.')),error=>setNotice(error instanceof Error?error.message:'Payment pending'))}>{tr('Check payment')}</Button></section>;
}
