import { requireDeveloper } from "@/lib/auth-guards";
import Link from "next/link";
import { GitBranch, ExternalLink, Code2, Terminal, ShieldAlert } from "lucide-react";

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
    },
    {
      name: "allskyfares-core",
      desc: "Enterprise core services, transactional mail handlers, DNS, and hosting configs.",
      branch: "main",
      url: "https://github.com/blank-ui",
      language: "Node / Cloud",
      status: "Active",
    },
  ];

  return (
    <main className="shell" style={{ padding: "40px 0 80px" }}>
      <div style={{ marginBottom: 28 }}>
        <div className="eyebrow" style={{ color: "#10b981", display: "flex", alignItems: "center", gap: 6 }}>
          <GitBranch size={14} /> Source Code & CI/CD
        </div>
        <h1 style={{ fontSize: 28, letterSpacing: "-.04em", margin: "6px 0", color: "var(--ink)" }}>
          Studio Code Repositories
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
          Centralized git repository directory and deployment targets for the engineering team.
        </p>
      </div>

      <div style={{ display: "grid", gap: 16, maxWidth: 840 }}>
        {repos.map((repo) => (
          <div key={repo.name} className="card" style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--ink)" }}>
                  {repo.name}
                </h3>
                <span style={{ fontSize: 11, background: "rgba(16,185,129,0.1)", color: "#059669", padding: "2px 8px", borderRadius: 99, fontWeight: 600 }}>
                  {repo.status}
                </span>
              </div>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 10px", lineHeight: 1.5 }}>
                {repo.desc}
              </p>
              <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--muted)" }}>
                <span>Default Branch: <strong>{repo.branch}</strong></span>
                <span>Language: <strong>{repo.language}</strong></span>
              </div>
            </div>

            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-outline"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", fontSize: 12 }}
            >
              <span>GitHub</span>
              <ExternalLink size={13} />
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
