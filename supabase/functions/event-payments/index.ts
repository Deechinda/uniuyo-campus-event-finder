import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,"Content-Type":"application/json"}});

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
  try{
    const secret=Deno.env.get("PAYSTACK_SECRET_KEY");
    const url=Deno.env.get("SUPABASE_URL");
    const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if(!secret||!url||!service) throw new Error("Payment service is not configured.");
    const admin=createClient(url,service,{auth:{persistSession:false}});
    const body=await req.json();
    const paystack=async(path:string,options:RequestInit={})=>{
      const response=await fetch(`https://api.paystack.co${path}`,{...options,headers:{Authorization:`Bearer ${secret}`,"Content-Type":"application/json",...(options.headers||{})}});
      const result=await response.json(); if(!result.status) throw new Error(result.message||"Paystack request failed"); return result.data;
    };

    if(body.action==="banks") return reply({ok:true,banks:await paystack("/bank?country=nigeria&currency=NGN")});
    if(body.action==="resolve-account"){
      const data=await paystack(`/bank/resolve?account_number=${encodeURIComponent(body.accountNumber)}&bank_code=${encodeURIComponent(body.bankCode)}`);
      return reply({ok:true,accountName:data.account_name,accountNumber:data.account_number});
    }
    if(body.action==="save-payout"){
      const auth=req.headers.get("Authorization")||"";
      const userClient=createClient(url,Deno.env.get("SUPABASE_ANON_KEY")||"",{global:{headers:{Authorization:auth}}});
      const {data:{user}}=await userClient.auth.getUser(); if(!user) throw new Error("Sign in to save a payout account.");
      const resolved=await paystack(`/bank/resolve?account_number=${encodeURIComponent(body.accountNumber)}&bank_code=${encodeURIComponent(body.bankCode)}`);
      if(resolved.account_name!==body.accountName) throw new Error("Account verification changed. Please verify again.");
      const sub=await paystack("/subaccount",{method:"POST",body:JSON.stringify({business_name:body.businessName,settlement_bank:body.bankCode,account_number:body.accountNumber,percentage_charge:0,primary_contact_email:user.email,primary_contact_name:body.businessName})});
      const {error}=await admin.from("event_profiles").update({paystack_subaccount_code:sub.subaccount_code,payout_bank_code:body.bankCode,payout_bank_name:body.bankName,payout_account_name:resolved.account_name,payout_account_last4:String(body.accountNumber).slice(-4),payout_verified:true}).eq("id",user.id);
      if(error) throw error; return reply({ok:true,accountName:resolved.account_name,last4:String(body.accountNumber).slice(-4)});
    }
    if(body.action==="initialize"){
      const {data:event,error:eventError}=await admin.from("campus_events").select("*").eq("id",body.eventId).eq("status","published").single();
      if(eventError||!event) throw new Error("Event not found."); if(event.price<=0) throw new Error("This event is free.");
      const quantity=Math.max(1,Math.min(10,Number(body.quantity))); const total=Number(event.price)*quantity;
      const {data:sold}=await admin.from("registrations").select("quantity").eq("event_id",event.id).in("payment_status",["paid","free"]);
      if((sold||[]).reduce((sum:number,row:{quantity:number})=>sum+row.quantity,0)+quantity>event.capacity) throw new Error("Not enough tickets available.");
      const reference=`UYO-${crypto.randomUUID()}`;
      const {data:registration,error}=await admin.from("registrations").insert({event_id:event.id,guest_name:body.name,guest_email:String(body.email).toLowerCase(),guest_phone:body.phone,quantity,total_amount:total,payment_reference:reference}).select().single();
      if(error) throw error;
      await admin.from("payments").insert({registration_id:registration.id,reference,amount:total});
      const {data:profile}=await admin.from("event_profiles").select("paystack_subaccount_code,payout_verified").eq("id",event.organizer_id).single();
      if(!profile?.payout_verified) throw new Error("Organizer payout account is not ready.");
      const initialized=await paystack("/transaction/initialize",{method:"POST",body:JSON.stringify({email:body.email,amount:Math.round(total*100),currency:"NGN",reference,callback_url:body.callbackUrl,subaccount:profile.paystack_subaccount_code,bearer:"subaccount",metadata:{registration_id:registration.id,event_id:event.id}})});
      return reply({ok:true,authorizationUrl:initialized.authorization_url,reference});
    }
    if(body.action==="verify"){
      const verified=await paystack(`/transaction/verify/${encodeURIComponent(body.reference)}`);
      if(verified.status!=="success") throw new Error("Payment has not been confirmed.");
      const {data:registration,error}=await admin.from("registrations").select("*,campus_events(title)").eq("payment_reference",verified.reference).single();
      if(error||!registration) throw new Error("Registration not found.");
      if(Math.round(Number(registration.total_amount)*100)!==Number(verified.amount)) throw new Error("Payment amount does not match.");
      const existing=await admin.from("tickets").select("ticket_code").eq("registration_id",registration.id).maybeSingle();
      let code=existing.data?.ticket_code;
      if(!code){code=`UYO-${crypto.randomUUID().replaceAll("-","").slice(0,10).toUpperCase()}`;await admin.from("tickets").insert({registration_id:registration.id,event_id:registration.event_id,ticket_code:code});}
      await admin.from("registrations").update({payment_status:"paid"}).eq("id",registration.id);
      await admin.from("payments").update({status:"paid",paid_at:new Date().toISOString()}).eq("reference",verified.reference);
      return reply({ok:true,ticket:{ticketCode:code,eventTitle:registration.campus_events.title,name:registration.guest_name,quantity:registration.quantity,amount:registration.total_amount,eventId:registration.event_id}});
    }
    throw new Error("Unknown action.");
  }catch(error){console.error(error);return reply({ok:false,error:error instanceof Error?error.message:"Request failed."},400);}
});
