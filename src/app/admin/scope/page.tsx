import { requireAdmin } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { ScopeActionsPage } from "@/components/scope-actions-page";
import type { ClientOption } from "@/components/scope-actions-modal";

export default async function AdminScopePage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: "take-scope" | "update-project" | "send-invite" }>;
}) {
  const session = await requireAdmin();
  const resolvedParams = searchParams ? await searchParams : {};

  const [allProjects, allInquiries, clients] = await Promise.all([
    prisma.project.findMany({
      include: {
        client: { select: { id: true, name: true, email: true } },
        milestones: { orderBy: { dueAt: "asc" } },
        tasks: { orderBy: { dueAt: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "CLIENT" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedProjects = allProjects.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    clientName: p.client?.name || "Client",
    clientEmail: p.client?.email || "",
    milestones: p.milestones.map((m: any) => ({
      id: m.id,
      title: m.title,
      dueAt: m.dueAt ? m.dueAt.toISOString() : null,
      completedAt: m.completedAt ? m.completedAt.toISOString() : null,
    })),
    tasks: p.tasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      dueAt: t.dueAt ? t.dueAt.toISOString() : null,
      completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    })),
  }));

  const serializedInquiries = allInquiries.map((inq) => ({
    id: inq.id,
    name: inq.name,
    email: inq.email,
    service: inq.service,
    budget: inq.budget,
    status: inq.status,
    createdAt: inq.createdAt.toISOString(),
    message: inq.message,
    company: inq.company,
    referenceUrl: inq.referenceUrl,
    referenceImage: inq.referenceImage,
  }));

  return (
    <ScopeActionsPage
      userRole="ADMIN"
      currentUserId={session.user.id}
      projects={serializedProjects}
      inquiries={serializedInquiries}
      availableClients={clients}
      initialTab={resolvedParams.tab}
    />
  );
}
