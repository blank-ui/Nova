import { requireClient } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { TeamDiscussionsManager, ProjectDiscussionSummary } from "@/components/team-discussions-manager";

export default async function PortalDiscussionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ projectId?: string }>;
}) {
  const session = await requireClient();
  const resolvedParams = searchParams ? await searchParams : {};
  const isStaff =
    session.user.role === "ADMIN" ||
    session.user.role === "DEVELOPER" ||
    session.user.role === "FINANCE";

  const rawProjects = await prisma.project.findMany({
    where: isStaff ? {} : { clientId: session.user.id },
    include: {
      client: {
        select: { id: true, name: true, email: true },
      },
      messages: {
        take: 1,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Get author names for latest messages
  const authorIds = Array.from(
    new Set(rawProjects.flatMap((p) => p.messages.map((m) => m.authorId)).filter(Boolean))
  );

  const authors =
    authorIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: authorIds } },
          select: { id: true, name: true },
        })
      : [];

  const authorMap = new Map(authors.map((a) => [a.id, a.name]));

  const projects: ProjectDiscussionSummary[] = rawProjects.map((p) => {
    const latest = p.messages[0];
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      updatedAt: p.updatedAt.toISOString(),
      client: p.client,
      messageCount: p._count.messages,
      lastMessage: latest
        ? {
            body: latest.body,
            createdAt: latest.createdAt.toISOString(),
            authorName: authorMap.get(latest.authorId) || "Team Member",
          }
        : null,
    };
  });

  return (
    <TeamDiscussionsManager
      projects={projects}
      currentUserId={session.user.id}
      currentUserRole={session.user.role ?? "CLIENT"}
      initialProjectId={resolvedParams.projectId}
    />
  );
}
