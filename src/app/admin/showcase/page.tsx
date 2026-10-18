import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { AdminShowcaseManager } from "@/components/admin-showcase-manager";

export default async function AdminShowcasePage() {
  await requireAdmin();

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

  // Fetch gallery items
  const galleryItems = await prisma.galleryItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Fetch live repos from GitHub for the user
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
      { headers, next: { revalidate: 60 } }
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
    console.warn("[Admin Showcase Page] Error fetching live repos:", e);
  }

  // Ensure any pre-selected repos exist in the list even if offline
  for (const name of visibleList) {
    if (!allRepos.some((r) => r.name === name)) {
      allRepos.push({
        name,
        description: "Featured Studio Repository",
        language: "TypeScript",
        stars: 0,
      });
    }
  }

  const serializedGallery = galleryItems.map((g) => ({
    ...g,
    createdAt: g.createdAt.toISOString(),
  }));

  return (
    <div style={{ width: "100%" }}>
      <AdminShowcaseManager
        initialGithubUser={settings.githubUser}
        initialVisibleRepos={visibleList}
        initialAvailableRepos={allRepos}
        initialGalleryItems={serializedGallery}
      />
    </div>
  );
}
