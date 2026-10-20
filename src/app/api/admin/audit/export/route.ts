import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth-guards";
import { canOpenAdmin } from "@/lib/auth-policy";

function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  try {
    const d = new Date(date);
    return isNaN(d.getTime()) ? "" : d.toISOString();
  } catch {
    return "";
  }
}

/**
 * GET /api/admin/audit/export
 * Downloads comprehensive user audit history, onboarding lifecycle, and geolocation logs.
 * Supports ?role=ALL|CLIENT|DEVELOPER|FINANCE|ADMIN, ?type=users|logins, ?userId=... and ?format=csv|json
 */
export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session || !canOpenAdmin(session.user.role, session.user.twoFactorEnabled)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const url = new URL(request.url);
  const role = url.searchParams.get("role")?.trim();
  const userId = url.searchParams.get("userId")?.trim();
  const type = url.searchParams.get("type")?.trim() || "users"; // "users" | "logins"
  const format = url.searchParams.get("format")?.trim() || "csv"; // "csv" | "json"

  const whereClause: any = {};
  if (userId) {
    whereClause.id = userId;
  } else if (role && role !== "ALL") {
    whereClause.role = role;
  }

  try {
    if (type === "logins") {
      // Row-by-row login history export
      const logins = await prisma.userLoginHistory.findMany({
        where: userId ? { userId } : role && role !== "ALL" ? { user: { role } } : undefined,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, banned: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (format === "json") {
        return NextResponse.json({ total: logins.length, logins });
      }

      const headers = [
        "Login Event ID",
        "User ID",
        "User Name",
        "User Email",
        "User Role",
        "Account Status",
        "Login Timestamp (UTC)",
        "IP Address",
        "City",
        "Country",
        "Country Code",
        "User Agent",
      ];

      const rows = logins.map((item) => [
        escapeCsvCell(item.id),
        escapeCsvCell(item.userId),
        escapeCsvCell(item.user.name),
        escapeCsvCell(item.user.email),
        escapeCsvCell(item.user.role),
        escapeCsvCell(item.user.banned ? "SUSPENDED" : "ACTIVE"),
        escapeCsvCell(formatDate(item.createdAt)),
        escapeCsvCell(item.ipAddress),
        escapeCsvCell(item.city || "Unknown"),
        escapeCsvCell(item.country || "Unknown"),
        escapeCsvCell(item.countryCode || ""),
        escapeCsvCell(item.userAgent || ""),
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
      const filename = `nova-login-history-${new Date().toISOString().split("T")[0]}.csv`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // Default: Comprehensive User Lifecycle & Audit Trail
    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        loginHistories: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: {
            projects: true,
            authSessions: true,
            loginHistories: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (format === "json") {
      return NextResponse.json({ total: users.length, users });
    }

    const headers = [
      "User ID",
      "Full Name",
      "Email Address",
      "Role",
      "Account Status",
      "Email Verified",
      "Phone",
      "Discord Handle",
      "Onboarding: Invite Sent Date",
      "Onboarding: Invite Seen Date",
      "Onboarding: Password Created Date",
      "Onboarding: Last Login Date",
      "Last Login IP",
      "Last Login City",
      "Last Login Country",
      "Total Login Sessions",
      "Recent Login Locations (City, Country [IP])",
      "Active Projects Count",
      "Account Created Date (UTC)",
    ];

    const rows = users.map((u) => {
      const historicalLocations = u.loginHistories
        .map((h) => `${h.city || "Unknown"}, ${h.country || "Unknown"} (${h.ipAddress}) [${formatDate(h.createdAt)}]`)
        .join("; ");

      return [
        escapeCsvCell(u.id),
        escapeCsvCell(u.name),
        escapeCsvCell(u.email),
        escapeCsvCell(u.role),
        escapeCsvCell(u.banned ? `SUSPENDED (${u.banReason || "Policy"})` : "ACTIVE"),
        escapeCsvCell(u.emailVerified ? "YES" : "NO"),
        escapeCsvCell(u.phone || ""),
        escapeCsvCell(u.discordHandle ? `@${u.discordHandle}` : ""),
        escapeCsvCell(formatDate(u.invitationSentAt)),
        escapeCsvCell(formatDate(u.invitationSeenAt)),
        escapeCsvCell(formatDate(u.passwordCreatedAt)),
        escapeCsvCell(formatDate(u.lastLoginAt)),
        escapeCsvCell(u.lastLoginIp || ""),
        escapeCsvCell(u.lastLoginCity || ""),
        escapeCsvCell(u.lastLoginCountry || ""),
        escapeCsvCell(u._count.loginHistories),
        escapeCsvCell(historicalLocations || "None recorded"),
        escapeCsvCell(u._count.projects),
        escapeCsvCell(formatDate(u.createdAt)),
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const filename = `nova-users-audit-history-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export audit history" },
      { status: 500 }
    );
  }
}
