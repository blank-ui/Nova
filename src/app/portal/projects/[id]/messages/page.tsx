import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAuthorizedProject } from "@/lib/project-access";
import { getCurrentSession } from "@/lib/auth-guards";
import { CUID_REGEX } from "@/lib/messages";
import { ProjectMessages } from "@/components/project-messages";

interface ProjectMessagesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectMessagesPage({ params }: ProjectMessagesPageProps) {
  const { id } = await params;

  if (!id || !CUID_REGEX.test(id)) {
    notFound();
  }

  const session = await getCurrentSession();
  if (!session) {
    notFound();
  }

  const project = await getAuthorizedProject(id);
  if (!project) {
    notFound();
  }

  // Fetch initial messages server-side
  const initialMessagesRaw = await prisma.message.findMany({
    where: { projectId: project.id },
    take: 51,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  let initialNextCursor: string | null = null;
  if (initialMessagesRaw.length > 50) {
    const nextItem = initialMessagesRaw.pop();
    if (nextItem) {
      initialNextCursor = nextItem.id;
    }
  }

  const distinctAuthorIds = Array.from(new Set(initialMessagesRaw.map((m) => m.authorId)));
  const users = await prisma.user.findMany({
    where: { id: { in: distinctAuthorIds } },
    select: { id: true, name: true, role: true },
  });

  const authorMap = new Map(users.map((u) => [u.id, u]));
  const initialMessages = initialMessagesRaw.map((m) => {
    const author = authorMap.get(m.authorId) ?? {
      id: m.authorId,
      name: "Unknown Member",
      role: "UNKNOWN",
    };
    return {
      id: m.id,
      projectId: m.projectId,
      authorId: m.authorId,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      author,
    };
  });

  return (
    <main className="shell" style={{ padding: "50px 0 80px" }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href={`/portal/projects/${project.id}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--muted)",
          }}
        >
          <ArrowLeft size={16} /> Back to project overview
        </Link>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div className="eyebrow">Project Messaging · {project.name}</div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", letterSpacing: "-0.04em", margin: "8px 0 0" }}>
          Team Discussion
        </h1>
        <p style={{ fontSize: 15, color: "var(--muted)", marginTop: 8, maxWidth: 640 }}>
          Direct communication channel with your Nova engineering and design team.
        </p>
      </div>

      <ProjectMessages
        projectId={project.id}
        currentUserId={session.user.id}
        initialMessages={initialMessages}
        initialNextCursor={initialNextCursor}
      />
    </main>
  );
}
