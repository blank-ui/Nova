import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { getStudioChannels } from "@/lib/studio-channels";
import {
  TeamDiscussionsManager,
  TeamMember,
  ProjectItem,
} from "@/components/team-discussions-manager";

export default async function AdminDiscussionsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    recipientId?: string;
    channel?: string;
    projectId?: string;
    mode?: "project" | "channel" | "direct";
  }>;
}) {
  const session = await requireAdmin();
  const resolvedParams = searchParams ? await searchParams : {};

  // Fetch all projects, team members, and studio channels
  const [projectsRaw, teamMembers, channels] = await Promise.all([
    prisma.project.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        paymentStatus: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "DEVELOPER", "FINANCE"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
      },
      orderBy: { name: "asc" },
    }),
    getStudioChannels(),
  ]);

  const projects: ProjectItem[] = projectsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    paymentStatus: p.paymentStatus,
    client: p.client,
    _count: p._count,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : undefined,
  }));

  const initialMode: "project" | "channel" | "direct" =
    resolvedParams.mode ||
    (resolvedParams.projectId
      ? "project"
      : resolvedParams.recipientId
      ? "direct"
      : resolvedParams.channel
      ? "channel"
      : "channel");

  const initialProjectId =
    resolvedParams.projectId ||
    (initialMode === "project" && projects.length > 0 ? projects[0].id : undefined);

  const initialChannel = resolvedParams.channel || "general";

  return (
    <TeamDiscussionsManager
      currentUserId={session.user.id}
      currentUserRole={session.user.role ?? "ADMIN"}
      teamMembers={teamMembers}
      projects={projects}
      channels={channels}
      initialProjectId={initialProjectId}
      initialRecipientId={resolvedParams.recipientId}
      initialChannel={initialChannel}
      initialMode={initialMode}
    />
  );
}
