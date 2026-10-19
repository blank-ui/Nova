"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PublicPage } from "@/components/public-page";
import { authClient } from "@/lib/auth-client";

import { useLanguage, T } from "@/components/language-provider";

function RecoveryForm(){
  const { t } = useLanguage();
  const [done,setDone]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");const email=String(new FormData(event.currentTarget).get("email")??"").trim().toLowerCase();try{const result=await authClient.requestPasswordReset({email,redirectTo:"/reset-password"});if(result.error)throw new Error("We couldn't start recovery. Please try again later.");setDone(true);}catch(e){setError(e instanceof Error?e.message:"We couldn't start recovery.");}finally{setBusy(false)}}
  return <div className="auth-card card" style={{maxWidth:500,padding:32}}><div className="eyebrow">{t("forgot.eyebrow", "Account recovery")}</div><h2 style={{letterSpacing:"-.05em"}}>{t("forgot.title", "A secure reset link.")}</h2>{done?<p role="status" style={{fontSize:14,lineHeight:1.8,color:"var(--muted)"}}>If an account can be recovered with that address, we&apos;ve sent a password reset link.</p>:<><p style={{fontSize:13,color:"var(--muted)",lineHeight:1.7}}>Enter your account email. We&apos;ll send a time-limited link if it matches an account.</p><form onSubmit={submit} style={{display:"grid",gap:14}}><label className="auth-label">{t("auth.email", "Email address")}<input className="field" type="email" name="email" autoComplete="email" required maxLength={254} placeholder="alex@company.com"/></label>{error&&<p role="alert" style={{color:"#b42318",fontSize:12}}>{error}</p>}<button type="submit" className="button" disabled={busy}>{busy?"Sending…":"Send reset link"}<ArrowUpRight size={15}/></button></form></>}<Link href="/login" style={{display:"inline-flex",alignItems:"center",gap:6,color:"var(--blue)",fontSize:12,marginTop:20}}><ArrowLeft size={13}/>{t("auth.signin_link", "Back to sign in")}</Link><style>{`@media(prefers-color-scheme:dark){.auth-card{background:#202431!important;border-color:#353b4b!important;color:#f4f5f8}.auth-label{color:#d5d8e0}.auth-card .field{background:#171b25;color:#f6f7fb;border-color:#454b5b}.auth-card p{color:#b8becc!important}}.auth-label{display:grid;gap:8px;font-size:12px;font-weight:700;color:#4f5664}`}</style></div>
}

export default function ForgotPassword(){
  return (
    <PublicPage
      eyebrow={<T k="forgot.eyebrow" fallback="Account recovery" />}
      title={<T k="forgot.title" fallback="We’ll help you get back in." />}
      subtitle={<T k="forgot.subtitle" fallback="A few steps to restore access, with a fresh link sent only to the account email." />}
    >
      <RecoveryForm/>
    </PublicPage>
  );
}
