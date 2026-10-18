import { UserProfileSecurity } from "@/components/user-profile-security";
import { requireClient } from "@/lib/auth-guards";
import { googleSignInAvailable, discordSignInAvailable } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PortalSecurity() {
  const session = await requireClient();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { discordHandle: true, image: true, phone: true, dateOfBirth: true },
  });

  return (
    <div className="animate-fade-in-up" style={{ width: "100%" }}>
      <div style={{ maxWidth: 840, margin: "0 auto 32px" }}>
        <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="radar-dot" style={{ width: 7, height: 7 }} />
          <span>Client space · Profile &amp; Security</span>
        </div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 44px)", letterSpacing: "-.06em", margin: "14px 0 10px" }}>
          Profile &amp; Security Settings
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.8, margin: 0 }}>
          Manage your profile, change verified email address, update credentials, manage authenticator MFA, and revoke active sessions.
        </p>
      </div>

      <UserProfileSecurity
        initialUser={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role ?? "CLIENT",
          phone: user?.phone ?? null,
          dateOfBirth: user?.dateOfBirth ?? null,
          image: user?.image ?? session.user.image ?? null,
          twoFactorEnabled: session.user.twoFactorEnabled ?? false,
          discordHandle: user?.discordHandle ?? null,
        }}
        accountRole="CLIENT"
        googleAvailable={googleSignInAvailable}
        discordAvailable={discordSignInAvailable}
      />
    </div>
  );
}

