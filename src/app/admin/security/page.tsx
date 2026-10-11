import { UserProfileSecurity } from "@/components/user-profile-security";
import { requireAdmin } from "@/lib/auth-guards";
import { googleSignInAvailable, discordSignInAvailable } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminSecurity() {
  const session = await requireAdmin({ allowMfaSetup: true });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { discordHandle: true },
  });

  return (
    <main className="shell" style={{ padding: "50px 0 80px" }}>
      <div style={{ maxWidth: 840, margin: "0 auto 32px" }}>
        <div className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="radar-dot" style={{ width: 7, height: 7 }} />
          <span>Administration · Profile & Security</span>
        </div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 44px)", letterSpacing: "-.06em", margin: "14px 0 10px" }}>
          Administrator Security & Controls
        </h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.8, margin: 0, fontSize: 15 }}>
          Manage administrator profile details, multi-factor authentication preferences, security credentials, and active device sessions.
        </p>
      </div>
      <UserProfileSecurity
        initialUser={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: "ADMIN",
          twoFactorEnabled: session.user.twoFactorEnabled ?? false,
          discordHandle: user?.discordHandle ?? "superr_nova_",
        }}
        accountRole="ADMIN"
        googleAvailable={googleSignInAvailable}
        discordAvailable={discordSignInAvailable}
      />
    </main>
  );
}


