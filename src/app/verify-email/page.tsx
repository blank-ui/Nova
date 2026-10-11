import Link from "next/link";
import { PublicPage } from "@/components/public-page";
export default function VerifyEmail(){return <PublicPage eyebrow="Email verification" title="Check your inbox." subtitle="Follow the one-time verification link Nova sent you. Once your email is confirmed, you can sign in to your client space."><Link className="button" href="/login">Continue to sign in</Link><p style={{fontSize:12,color:"var(--muted)",marginTop:14}}>If the message is missing, sign in again to request a fresh verification email.</p></PublicPage>}
