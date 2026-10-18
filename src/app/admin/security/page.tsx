import { UserProfileSecurity } from "@/components/user-profile-security";
import { requireAdmin } from "@/lib/auth-guards";
import { googleSignInAvailable, discordSignInAvailable } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, SectionCard, DetailRow, Badge } from "@/components/admin-ui";
import { Shield, Lock, Mail, Clock, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";

export default async function AdminSecurity() {
  const session = await requireAdmin({ allowMfaSetup: true });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { discordHandle: true, image: true },
  });

  const isMfaActive = Boolean(session.user.twoFactorEnabled);

  return (
    <div className="animate-fade-in-up" style={{ width: "100%" }}>
      {/* Page Header */}
      <PageHeader
        titleLine1="Security &"
        titleLine2="Governance"
        backHref="/admin"
        stats={[
          {
            icon: <Shield size={18} strokeWidth={1.8} />,
            value: "ADMIN",
            badgeLabel: "Role",
            badgeVariant: "brand",
            caption: "Full workspace authority",
          },
          {
            icon: <Lock size={18} strokeWidth={1.8} />,
            value: isMfaActive ? "Active" : "Disabled",
            badgeLabel: "TOTP MFA",
            badgeVariant: isMfaActive ? "success" : "warning",
            caption: isMfaActive ? "Authenticator 2FA enforced" : "Optional · Setup recommended",
          },
          {
            icon: <Mail size={18} strokeWidth={1.8} />,
            value: "Operational",
            badgeLabel: "Dispatch",
            badgeVariant: "info",
            caption: "System notifications active",
          },
        ]}
      />

      {/* Governance Quick Overview */}
      <div style={{ marginBottom: 24 }}>
        <SectionCard title="System & Session Governance">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            <DetailRow
              icon={<ShieldCheck size={16} strokeWidth={1.8} />}
              label="Role Authorization"
              value="Admin workspace access"
              action={<Badge variant="brand">ADMIN</Badge>}
            />

            <DetailRow
              icon={<Lock size={16} strokeWidth={1.8} />}
              label="Two-Factor Auth (TOTP)"
              value={isMfaActive ? "Enforced · Authenticator app" : "Optional · not set up"}
              action={
                isMfaActive ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: 99,
                      background: "var(--accent-yellow)",
                      color: "var(--text-primary)",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    Enable
                  </span>
                )
              }
            />

            <DetailRow
              icon={<Mail size={16} strokeWidth={1.8} />}
              label="Operations Dispatch"
              value="nova@allskyfares.com"
            />

            <DetailRow
              icon={<Clock size={16} strokeWidth={1.8} />}
              label="Signed in as"
              value={session.user.email}
              action={<Badge variant="neutral">Active Session</Badge>}
            />
          </div>
        </SectionCard>
      </div>

      {/* Interactive Controls & Settings */}
      <UserProfileSecurity
        initialUser={{
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: "ADMIN",
          image: user?.image ?? session.user.image ?? null,
          twoFactorEnabled: session.user.twoFactorEnabled ?? false,
          discordHandle: user?.discordHandle ?? "superr_nova_",
        }}
        accountRole="ADMIN"
        googleAvailable={googleSignInAvailable}
        discordAvailable={discordSignInAvailable}
      />
    </div>
  );
}
