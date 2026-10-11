"use client";
import { FormEvent, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { safeInternalPath } from "@/lib/safe-redirect";

export function MfaVerifyForm(){
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");const form=new FormData(event.currentTarget);const code=String(form.get("code")??"").replace(/\s/g,"");try{const result=await authClient.twoFactor.verifyTotp({code,trustDevice:false});if(result.error)throw new Error("That code couldn't be verified. Check your authenticator and try again.");const target=safeInternalPath(sessionStorage.getItem("nova-auth-next"),"/auth/continue");sessionStorage.removeItem("nova-auth-next");window.location.assign(target);}catch(e){setError(e instanceof Error?e.message:"We couldn't verify that code.");}finally{setBusy(false)}}
 return <form onSubmit={submit} style={{display:"grid",gap:14}}><label className="auth-label">6-digit authenticator code<input className="field" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required placeholder="000000"/></label>{error&&<p role="alert" style={{fontSize:12,color:"#b42318"}}>{error}</p>}<button className="button" disabled={busy}>{busy?"Verifying…":"Verify and continue"}<ArrowUpRight size={15}/></button><style>{`.auth-label{display:grid;gap:8px;font-size:12px;font-weight:700;color:var(--ink)}`}</style></form>
}
