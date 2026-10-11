import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";

/**
 * GET /api/admin/github
 * Returns current GitHub account configuration and list of repos fetched from GitHub
 */
export async function GET() {
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    let settings = await prisma.studioSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.studioSettings.create({
        data: {
          id: "default",
          githubUser: "blank-ui",
          visibleRepos: JSON.stringify(["Nova"]),
        },
      });
    }

    let visibleList: string[] = [];
    try {
      visibleList = JSON.parse(settings.visibleRepos);
    } catch {}

    // Fetch live repos from GitHub for this configured user
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Nova-Agency-Platform",
    };
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    let allRepos: { name: string; description: string; language: string; stars: number }[] = [];
    try {
      const ghRes = await fetch(
        `https://api.github.com/users/${encodeURIComponent(settings.githubUser)}/repos?sort=updated&per_page=60`,
        { headers }
      );
      if (ghRes.ok) {
        const data = await ghRes.json();
        if (Array.isArray(data)) {
          allRepos = data.map((r: { name: string; description: string; language: string; stargazers_count: number }) => ({
            name: r.name,
            description: r.description || "",
            language: r.language || "TypeScript",
            stars: r.stargazers_count || 0,
          }));
        }
      }
    } catch (e) {
      console.warn("[Admin GitHub API] Failed to fetch external repos:", e);
    }

    return NextResponse.json({
      githubUser: settings.githubUser,
      visibleRepos: visibleList,
      availableRepos: allRepos,
    });
  } catch (err) {
    console.error("[Admin GitHub API] Error:", err);
    return NextResponse.json({ error: "Failed to load GitHub settings" }, { status: 500 });
  }
}

/**
 * POST /api/admin/github
 * Updates GitHub user and visible repos selection
 */
export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const githubUser = String(body.githubUser ?? "blank-ui").trim();
  const visibleRepos = Array.isArray(body.visibleRepos) ? body.visibleRepos : [];

  try {
    const updated = await prisma.studioSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        githubUser,
        visibleRepos: JSON.stringify(visibleRepos),
      },
      update: {
        githubUser,
        visibleRepos: JSON.stringify(visibleRepos),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "UPDATE",
        entityType: "StudioSettings",
        entityId: "default",
        metadata: { githubUser, visibleCount: visibleRepos.length },
      },
    });

    return NextResponse.json({
      success: true,
      githubUser: updated.githubUser,
      visibleRepos,
    });
  } catch (err) {
    console.error("[Admin GitHub API] Error saving settings:", err);
    return NextResponse.json({ error: "Failed to save GitHub settings" }, { status: 500 });
  }
}
