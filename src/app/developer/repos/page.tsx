import { requireDeveloper } from "@/lib/auth-guards";
import { GitBranch, ExternalLink, ArrowLeft, FolderGit2, ShieldCheck, Terminal } from "lucide-react";
import Link from "next/link";
import { PageHeader, SectionCard, Badge, PillButton } from "@/components/admin-ui";

export default async function DeveloperReposPage() {
  await requireDeveloper();

  const repos = [
    {
      name: "blank-ui/Nova",
      desc: "Full-stack Next.js 16 studio platform, Better Auth, Prisma ORM MySQL, Discord CRM integration.",
      branch: "main",
      url: "https://github.com/blank-ui/Nova",
      language: "TypeScript",
      status: "Production Ready",
      isPrimary: true,
    },
    {
      name: "allskyfares-core",
      desc: "Enterprise core services, transactional mail handlers, DNS, and hosting configs under All Sky Fares LLC.",
      branch: "main",
      url: "https://github.com/blank-ui",
      language: "Node / Cloud",
      status: "Active",
      isPrimary: false,
    },
  ];

  return (
    <div className="animate-fade-in-up" style={{ width: "100%" }}>
      <PageHeader
        titleLine1="Studio"
        titleLine2="Repositories"
        stats={[
          {
            icon: <GitBranch size={18} strokeWidth={1.8} />,
            value: repos.length,
            badgeLabel: "Git",
            badgeVariant: "info",
            caption: "Active repositories",
          },
          {
            icon: <Terminal size={18} strokeWidth={1.8} />,
            value: "main",
            badgeLabel: "Target",
            badgeVariant: "success",
            caption: "Primary deploy branch",
          },
          {
            icon: <ShieldCheck size={18} strokeWidth={1.8} />,
            value: "CI/CD",
            badgeLabel: "Verified",
            badgeVariant: "neutral",
            caption: "Build pipelines",
          },
        ]}
      />

      <div style={{ marginBottom: 24 }}>
        <PillButton variant="outline" href="/developer" icon={<ArrowLeft size={14} />}>
          Back to Sprint Console
        </PillButton>
      </div>

      <SectionCard
        title="Connected Code Repositories & CI/CD Targets"
        headerRight={<Badge variant="info">{repos.length} Repositories</Badge>}
      >
        <div style={{ display: "grid", gap: 14 }}>
          {repos.map((repo) => (
            <div
              key={repo.name}
              style={{
                padding: "20px 22px",
                borderRadius: "var(--radius-card)",
                background: "var(--surface-raised)",
                border: "1px solid var(--border-hairline-light)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <div style={{ minWidth: 0, maxWidth: 640 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                  <FolderGit2 size={18} color="var(--brand-primary, #6366F1)" />
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                    {repo.name}
                  </h3>
                  <Badge variant={repo.isPrimary ? "success" : "neutral"}>
                    {repo.status}
                  </Badge>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted-crm)", margin: "0 0 12px", lineHeight: 1.6 }}>
                  {repo.desc}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: "var(--text-secondary)" }}>
                  <span>Default Branch: <strong>{repo.branch}</strong></span>
                  <span>&middot;</span>
                  <span>Language: <strong>{repo.language}</strong></span>
                </div>
              </div>

              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "var(--ink-crm)",
                  color: "var(--ink-crm-text, #FFFFFF)",
                  textDecoration: "none",
                }}
              >
                <span>GitHub Repo</span>
                <ExternalLink size={13} />
              </a>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
