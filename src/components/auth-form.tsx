"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { safeInternalPath } from "@/lib/safe-redirect";
import { NovaMark, NovaMascotAvatar } from "@/components/brand";


export function AuthForm({ mode, googleAvailable, discordAvailable = false, callbackURL = "/portal" }: { mode: "login" | "register"; googleAvailable: boolean; discordAvailable?: boolean; callbackURL?: string }) {
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const target = safeInternalPath(callbackURL, "/portal");
  const completeUrl = `/auth/continue?next=${encodeURIComponent(target)}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    try {
      if (mode === "register") {
        const name = String(data.get("name") ?? "").trim();
        const result = await authClient.signUp.email({ name, email, password, callbackURL: completeUrl });
        if (result.error) throw new Error("We couldn't create that account. Check the details and try again.");
        setSuccess(true);
        return;
      }
      sessionStorage.setItem("nova-auth-next", completeUrl);
      const result = await authClient.signIn.email({ email, password, callbackURL: completeUrl, rememberMe: true });
      if (result.error) throw new Error("Email or password is incorrect, or the account still needs email verification.");
      if ((result.data as { twoFactorRedirect?: boolean })?.twoFactorRedirect) {
        window.location.assign("/login/verify-mfa");
        return;
      }
      window.location.assign(completeUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We couldn't complete sign-in. Please try again.");
    } finally { setBusy(false); }
  }

  async function googleSignIn() {
    setBusy(true); setMessage("");
    try {
      sessionStorage.setItem("nova-auth-next", completeUrl);
      const result = await authClient.signIn.social({ provider: "google", callbackURL: completeUrl, errorCallbackURL: `/login?callbackURL=${encodeURIComponent(target)}` });
      if (result.error) throw new Error("Google sign-in is unavailable. Check the provider setup or use email and password.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Google sign-in couldn't be started."); setBusy(false); }
  }

  async function discordSignIn() {
    setBusy(true); setMessage("");
    try {
      sessionStorage.setItem("nova-auth-next", completeUrl);
      const result = await authClient.signIn.social({ provider: "discord", callbackURL: completeUrl, errorCallbackURL: `/login?callbackURL=${encodeURIComponent(target)}` });
      if (result.error) throw new Error("Discord sign-in is unavailable. Check the provider setup or use email and password.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Discord sign-in couldn't be started."); setBusy(false); }
  }

  if (success) return <div className="auth-card card" style={{maxWidth:510,padding:"clamp(24px,4vw,40px)",textAlign:"center"}} role="status"><div style={{display:"flex",justifyContent:"center",marginBottom:16}}><NovaMascotAvatar size={58} /></div><h2 style={{fontSize:25,letterSpacing:"-.05em"}}>Check your inbox</h2><p style={{fontSize:14,color:"var(--muted)",lineHeight:1.8}}>If the address can be registered, Nova has sent an email verification link. Follow it to confirm the account before signing in.</p><Link href="/login" className="button" style={{marginTop:12}}>Continue to sign in</Link></div>;

  return <div className="auth-card card" style={{maxWidth:510,padding:"clamp(24px,4vw,40px)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <div className="eyebrow">{mode === "login" ? "Welcome back" : "A good place to begin"}</div>
      <NovaMark size={22} starColor="#6C4CFF" dotColor="#FFB547" />
    </div>
    <h2 style={{fontSize:28,letterSpacing:"-.06em",margin:"6px 0 5px"}}>{mode === "login" ? "Sign in to your space." : "Create your client account."}</h2>
    <p style={{fontSize:13,color:"var(--muted)",lineHeight:1.7,margin:"0 0 23px"}}>{mode === "login" ? "Pick up where your project left off." : "A client workspace is created with your project."}</p>

    <div style={{display:"grid",gap:10}}>
      <button type="button" className="button button-outline" style={{width:"100%",borderRadius:12,justifyContent:"center",opacity:googleAvailable?1:.65}} disabled={!googleAvailable||busy} onClick={googleSignIn} aria-describedby={!googleAvailable?"google-note":undefined}><GoogleMark/>Continue with Google</button>
      <button type="button" className="button button-outline" style={{width:"100%",borderRadius:12,justifyContent:"center",opacity:discordAvailable?1:.65}} disabled={!discordAvailable||busy} onClick={discordSignIn} aria-describedby={!discordAvailable?"discord-note":undefined}><DiscordMark/>Continue with Discord</button>
    </div>
    {!googleAvailable && !discordAvailable && <p id="social-note" style={{fontSize:11,color:"var(--muted)",margin:"8px 0 0"}}>Social sign-in (Google & Discord) is ready for setup; provider credentials are not configured.</p>}
    {googleAvailable && !discordAvailable && <p id="discord-note" style={{fontSize:11,color:"var(--muted)",margin:"8px 0 0"}}>Discord OAuth is ready for setup; configure DISCORD_CLIENT_ID in environment.</p>}
    <div style={{display:"flex",alignItems:"center",gap:12,margin:"22px 0",color:"#9095a2",fontSize:11}}><span style={{height:1,background:"var(--line)",flex:1}}/>OR CONTINUE WITH EMAIL<span style={{height:1,background:"var(--line)",flex:1}}/></div>
    <form onSubmit={submit} style={{display:"grid",gap:15}}>
      {mode === "register"&&<label className="auth-label">Your name<input className="field" name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Alex Morgan"/></label>}
      <label className="auth-label">Email address<input className="field" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="alex@company.com"/></label>
      <label className="auth-label">Password<span className="password-wrap"><input className="field" name="password" type={showPassword?"text":"password"} autoComplete={mode === "login"?"current-password":"new-password"} required minLength={mode === "register"?12:1} maxLength={128} placeholder={mode === "register"?"At least 12 characters":"Your password"}/><button className="visibility-button" type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label>
      {mode === "login"&&<Link href="/forgot-password" style={{fontSize:12,color:"var(--blue)",justifySelf:"end",marginTop:-5}}>Forgot password?</Link>}
      {message&&<p role="alert" style={{fontSize:12,color:"#b42318",margin:0,lineHeight:1.6}}>{message}</p>}
      <button className="button" disabled={busy} style={{width:"100%",borderRadius:12,opacity:busy?.7:1}}>{busy?(mode==="login"?"Signing in…":"Creating account…"):(mode==="login"?"Sign in":"Create account")}<ArrowUpRight size={15}/></button>
      {mode === "register"&&<p style={{fontSize:11,color:"var(--muted)",textAlign:"center",margin:"6px 0 0",lineHeight:1.6}}>By creating an account, you agree to our <Link href="/terms" style={{textDecoration:"underline",color:"inherit"}}>Terms</Link> and <Link href="/privacy" style={{textDecoration:"underline",color:"inherit"}}>Privacy Policy</Link>. Operated by All Sky Fares LLC.</p>}
    </form>
    <p style={{fontSize:12,color:"var(--muted)",textAlign:"center",margin:"20px 0 0"}}>{mode === "login"?<>New to Nova? <Link href="/register" style={{color:"var(--blue)"}}>Create an account</Link></>:<>Already have an account? <Link href="/login" style={{color:"var(--blue)"}}>Sign in</Link></>}</p>

    <style>{`.auth-label{display:grid;gap:8px;font-size:12px;font-weight:700;color:var(--ink)}.password-wrap{position:relative}.password-wrap .field{padding-right:46px}.visibility-button{position:absolute;right:13px;top:50%;transform:translateY(-50%);border:0;background:transparent;color:var(--muted);display:grid;place-items:center;cursor:pointer;padding:5px}.auth-card:focus-within{scroll-margin-top:100px}`}</style>
  </div>;
}

function GoogleMark(){return <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.87c-.58 2.96-2.23 5.48-4.69 7.18l7.57 5.88c4.42-4.08 7.23-10.1 7.23-17.53Z"/><path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a24.02 24.02 0 0 0 0 21.56l7.98-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.57-5.88c-2.1 1.42-4.78 2.28-8.33 2.28-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>}

function DiscordMark(){return <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="#5865F2" aria-hidden="true"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.91,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>}
