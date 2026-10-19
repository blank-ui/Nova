import { requireClient } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { ClientPortalTracker } from "@/components/client-portal-tracker";

export default async function PortalProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ clientId?: string }>;
}) {
  const session = await requireClient();
  const isUserAdmin = session.user.role === "ADMIN";
  const isStaff = session.user.role === "ADMIN" || session.user.role === "DEVELOPER" || session.user.role === "FINANCE";
  const resolvedParams = searchParams ? await searchParams : {};

  let projectsData: Array<any> = [];
  let inquiriesData: Array<any> = [];
  let availableClients: Array<{ id: string; name: string; email: string }> = [];
  let displayUserName = session.user.name || "Client";
  let displayUserEmail = session.user.email || "";

  if (isStaff) {
    availableClients = await prisma.user.findMany({
      where: { role: "CLIENT" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  }

  if (isStaff && !resolvedParams.clientId) {
    // Staff view: load all studio projects and inquiries
    const [allProjects, allInquiries] = await Promise.all([
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
    ]);

    projectsData = allProjects;
    inquiriesData = allInquiries;
    displayUserName = session.user.name || (session.user.role === "DEVELOPER" ? "Engineer Console" : "Studio Admin");
  } else {
    // Client view or specific client filter
    const targetId = isStaff && resolvedParams.clientId ? resolvedParams.clientId : session.user.id;

    let clientUser = await prisma.user.findUnique({
      where: { id: targetId },
      include: {
        projects: {
          include: {
            client: { select: { id: true, name: true, email: true } },
            milestones: { orderBy: { dueAt: "asc" } },
            tasks: { orderBy: { dueAt: "asc" } },
          },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    if (!clientUser) {
      clientUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          projects: {
            include: {
              client: { select: { id: true, name: true, email: true } },
              milestones: { orderBy: { dueAt: "asc" } },
              tasks: { orderBy: { dueAt: "asc" } },
            },
            orderBy: { updatedAt: "desc" },
          },
        },
      });
    }

    if (clientUser) {
      displayUserName = clientUser.name;
      displayUserEmail = clientUser.email;
      projectsData = clientUser.projects;

      inquiriesData = await prisma.inquiry.findMany({
        where: { email: clientUser.email },
        orderBy: { createdAt: "desc" },
      });
    }
  }

  const serializedProjects = projectsData.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    client: p.client ? { id: p.client.id, name: p.client.name, email: p.client.email } : null,
    milestones: (p.milestones || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      dueAt: m.dueAt ? m.dueAt.toISOString() : null,
      completedAt: m.completedAt ? m.completedAt.toISOString() : null,
    })),
    tasks: (p.tasks || []).map((t: any) => ({
      id: t.id,
      title: t.title,
      dueAt: t.dueAt ? t.dueAt.toISOString() : null,
      completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    })),
  }));

  const serializedInquiries = inquiriesData.map((inq) => ({
    id: inq.id,
    service: inq.service,
    budget: inq.budget,
    company: inq.company,
    message: inq.message,
    status: inq.status,
    referenceUrl: inq.referenceUrl,
    referenceImage: inq.referenceImage,
    createdAt: inq.createdAt.toISOString(),
  }));

  return (
    <div className="animate-fade-in-up" style={{ width: "100%", padding: "12px 0" }}>
      <ClientPortalTracker
        userName={displayUserName}
        userEmail={displayUserEmail}
        userRole={session.user.role ?? "CLIENT"}
        projects={serializedProjects}
        inquiries={serializedInquiries}
        availableClients={availableClients}
        isAdminPreview={isUserAdmin}
      />
    </div>
  );
}
