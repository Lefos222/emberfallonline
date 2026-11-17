import {createFileRoute} from '@tanstack/react-router';
export const Route=createFileRoute('/api/public/payments/webhook')({staticData:{sitemap:false},server:{handlers:{POST:async({request})=>{
 const env=new URL(request.url).searchParams.get('env');
 if(env!=='sandbox' && env!=='live') return new Response('Invalid environment',{status:400});
 try {const {paymentWebhook}=await import('@/game/payment-delivery.server'); await paymentWebhook(request,env);return Response.json({received:true});}
 catch {return new Response('Payment processing unavailable; retry delivery.',{status:400});}
}}}});
