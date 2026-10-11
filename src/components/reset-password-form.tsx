"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm({token}:{token:string}){
 const [busy,setBusy]=useState(false);const [done,setDone]=useState(false);const [error,setError]=useState("");
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError("");const password=String(new FormData(event.currentTarget).get("password")??"");try{const result=await authClient.resetPassword({newPassword:password,token});if(result.error)throw new Error("This reset link is invalid or expired. Request a fresh link and try again.");setDone(true);}catch(e){setError(e instanceof Error?e.message:"The password could not be reset.");}finally{setBusy(false)}}
 if(!token)return <p role="alert" style={{color:"#b42318"}}>This reset link is missing its token. Request a new link to continue.</p>;
  return <div className="card auth-reset" style={{maxWidth:500,padding:32}}><h2 style={{letterSpacing:"-.05em"}}>Choose a new password.</h2>{done?<><p role="status" style={{color:"var(--muted)",fontSize:14,lineHeight:1.7}}>Your password has been updated. Your existing sessions have been revoked.</p><Link className="button" href="/login">Sign in</Link></>:<form onSubmit={submit} style={{display:"grid",gap:14}}><label className="auth-label">New password<input className="field" type="password" name="password" autoComplete="new-password" minLength={12} maxLength={128} required placeholder="At least 12 characters"/></label>{error&&<p role="alert" style={{color:"#b42318",fontSize:12}}>{error}</p>}<button className="button" disabled={busy}>{busy?"Updating…":"Update password"}<ArrowUpRight size={15}/></button></form>}<style>{`.auth-label{display:grid;gap:8px;font-size:12px;font-weight:700;color:var(--ink)}`}</style></div>
}
