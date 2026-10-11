import { NextResponse } from "next/server";

export interface GitHubRepo {
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  topics: string[];
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const targetUser = url.searchParams.get("user") || process.env.GITHUB_USERNAME || "anshu1008";
  const repoName = url.searchParams.get("repo");

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Nova-Agency-Platform",
  };

  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // If specific repo is requested, return repository details and latest commits
    if (repoName) {
      const [repoRes, commitsRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${encodeURIComponent(targetUser)}/${encodeURIComponent(repoName)}`, {
          headers,
          next: { revalidate: 300 },
        }),
        fetch(`https://api.github.com/repos/${encodeURIComponent(targetUser)}/${encodeURIComponent(repoName)}/commits?per_page=5`, {
          headers,
          next: { revalidate: 300 },
        }),
      ]);

      if (!repoRes.ok) {
        return NextResponse.json(
          { error: `GitHub repository ${targetUser}/${repoName} not found (${repoRes.status})` },
          { status: repoRes.status === 404 ? 404 : 502 }
        );
      }

      const repoData = await repoRes.json();
      const commitsData = commitsRes.ok ? await commitsRes.json() : [];

      const commits: GitHubCommit[] = Array.isArray(commitsData)
        ? commitsData.map((c: { sha?: string; commit?: { message?: string; author?: { name?: string; date?: string } }; html_url?: string }) => ({
            sha: (c.sha || "").slice(0, 7),
            message: c.commit?.message?.split("\n")[0] || "Update",
            author: c.commit?.author?.name || targetUser,
            date: c.commit?.author?.date || new Date().toISOString(),
            url: c.html_url || `https://github.com/${targetUser}/${repoName}`,
          }))
        : [];

      return NextResponse.json({
        user: targetUser,
        repo: {
          name: repoData.name,
          description: repoData.description,
          html_url: repoData.html_url,
          stargazers_count: repoData.stargazers_count,
          forks_count: repoData.forks_count,
          language: repoData.language,
          updated_at: repoData.updated_at,
          topics: repoData.topics || [],
        },
        commits,
      });
    }

    // Otherwise, fetch public repositories for targetUser
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(targetUser)}/repos?sort=updated&per_page=6`,
      {
        headers,
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      // Fallback curated repositories to gracefully render when offline or rate-limited
      return NextResponse.json({
        user: targetUser,
        isFallback: true,
        repos: [
          {
            name: "Nova",
            description: "Production web development studio platform with MFA, client portals, and CRM.",
            html_url: `https://github.com/${targetUser}/Nova`,
            stargazers_count: 12,
            forks_count: 2,
            language: "TypeScript",
            updated_at: new Date().toISOString(),
            topics: ["nextjs", "typescript", "prisma", "mysql", "better-auth"],
          },
          {
            name: "react-modern-system",
            description: "High-performance modular UI system with dark mode tokens and micro-interactions.",
            html_url: `https://github.com/${targetUser}/react-modern-system`,
            stargazers_count: 8,
            forks_count: 1,
            language: "TypeScript",
            updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            topics: ["react", "design-system", "css-variables"],
          },
          {
            name: "cloud-edge-gateway",
            description: "Zero-trust edge authentication middleware and rate-limiting gateway.",
            html_url: `https://github.com/${targetUser}/cloud-edge-gateway`,
            stargazers_count: 15,
            forks_count: 3,
            language: "Go",
            updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            topics: ["security", "edge-computing", "rate-limiting"],
          },
        ],
      });
    }

    const reposData = await res.json();
    const repos: GitHubRepo[] = Array.isArray(reposData)
      ? reposData.map((r: { name: string; description: string; html_url: string; stargazers_count: number; forks_count: number; language: string; updated_at: string; topics: string[] }) => ({
          name: r.name,
          description: r.description || "Active development repository",
          html_url: r.html_url,
          stargazers_count: r.stargazers_count || 0,
          forks_count: r.forks_count || 0,
          language: r.language || "TypeScript",
          updated_at: r.updated_at,
          topics: r.topics || [],
        }))
      : [];

    return NextResponse.json({
      user: targetUser,
      repos,
      isFallback: false,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "GitHub API connection failure" },
      { status: 502 }
    );
  }
}
