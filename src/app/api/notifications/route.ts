import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export interface NotificationItem {
  id: string;
  type: "inquiry" | "appointment" | "project" | "security" | "system";
  title: string;
  subtitle: string;
  href: string;
  createdAt: string;
  unread: boolean;
}

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const notifications: NotificationItem[] = [];

  try {
    if (isAdmin) {
      // 1. Fetch recent inquiries (especially NEW)
      const recentInquiries = await prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      for (const inq of recentInquiries) {
        notifications.push({
          id: `inq-${inq.id}`,
          type: "inquiry",
          title: inq.status === "NEW" ? "New Lead Submission" : `Inquiry: ${inq.service}`,
          subtitle: `${inq.name} (${inq.email}) · ${inq.budget || "Custom"} · ${inq.status}`,
          href: `/admin/inquiry/${inq.id}`,
          createdAt: inq.createdAt.toISOString(),
          unread: inq.status === "NEW",
        });
      }

      // 2. Fetch upcoming appointments
      const upcomingApts = await prisma.appointment.findMany({
        take: 5,
        orderBy: { date: "desc" },
      });

      for (const apt of upcomingApts) {
        notifications.push({
          id: `apt-${apt.id}`,
          type: "appointment",
          title: `Consultation: ${apt.title}`,
          subtitle: `Scheduled for ${new Date(apt.date).toLocaleDateString([], { month: "short", day: "numeric" })} · ${apt.status}`,
          href: "/admin/appointments",
          createdAt: apt.createdAt.toISOString(),
          unread: apt.status === "SCHEDULED",
        });
      }

      // 3. Fetch recent audit events
      const recentAudit = await prisma.auditLog.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { name: true } },
        },
      });

      for (const log of recentAudit) {
        notifications.push({
          id: `audit-${log.id}`,
          type: "security",
          title: `Audit: ${log.action}`,
          subtitle: `By ${log.actor?.name || "System"} on ${log.entityType}`,
          href: "/admin/security",
          createdAt: log.createdAt.toISOString(),
          unread: false,
        });
      }
    } else {
      // CLIENT NOTIFICATIONS
      // 1. Client's inquiries
      const myInquiries = await prisma.inquiry.findMany({
        where: { email: session.user.email },
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      for (const inq of myInquiries) {
        notifications.push({
          id: `inq-${inq.id}`,
          type: "inquiry",
          title: `Project Scope Status: ${inq.status}`,
          subtitle: `${inq.service} · Studio review in progress`,
          href: "/portal/projects",
          createdAt: inq.createdAt.toISOString(),
          unread: inq.status !== "NEW",
        });
      }

      // 2. Client's projects
      const myProjects = await prisma.project.findMany({
        where: { clientId: session.user.id },
        take: 5,
        orderBy: { updatedAt: "desc" },
      });

      for (const p of myProjects) {
        notifications.push({
          id: `proj-${p.id}`,
          type: "project",
          title: `Project Update: ${p.name}`,
          subtitle: `Status: ${p.status.replace("_", " ")}`,
          href: `/portal/projects/${p.id}`,
          createdAt: p.updatedAt.toISOString(),
          unread: false,
        });
      }
    }

    // Sort all by createdAt desc
    notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const unreadCount = notifications.filter((n) => n.unread).length;

    return NextResponse.json({
      notifications: notifications.slice(0, 10),
      unreadCount,
    });
  } catch (err) {
    console.error("[Notifications API Error]:", err);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}
