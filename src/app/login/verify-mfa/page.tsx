import { PublicPage } from "@/components/public-page";
import { MfaVerifyForm } from "@/components/mfa-verify-form";
export default function VerifyMfa(){return <PublicPage eyebrow="Administrator security · Step two" title="One more secure step." subtitle="Enter the current code from your authenticator app. Nova never asks you to share this code with anyone."><div className="card" style={{maxWidth:480,padding:30}}><MfaVerifyForm/></div></PublicPage>}
