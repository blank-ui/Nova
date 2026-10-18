import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * GET /api/appointments
 * Fetches appointments based on user role:
 * - Admin/Staff: All appointments across the workspace
 * - Client: Only their own appointments
 */
export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isStaff = ["ADMIN", "DEVELOPER", "FINANCE"].includes(session.user.role ?? "");
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  try {
    const where: any = {};
    if (!isStaff) {
      where.OR = [
        { requestedById: session.user.id },
        { assignedStaffId: session.user.id },
      ];
    }
    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { date: "asc" },
      include: {
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        assignedStaff: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ appointments });
  } catch (err) {
    console.error("[Appointments GET error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load appointments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments
 * - Client: Requests a new consultation or deliverable review appointment
 * - Admin/Staff: Sets/Schedules an appointment directly with a client
 */
export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await consumeRateLimit(`appointment:${session.user.id}:${clientIp}`, {
    max: 20,
    windowSeconds: 60,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { title, description, date, duration, meetingLink, clientId, assignedStaffId, status } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!date) {
      return NextResponse.json({ error: "Date and time are required" }, { status: 400 });
    }

    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Reject appointment dates in the past (allowing 60s grace for network/clock drift)
    if (appointmentDate.getTime() < Date.now() - 60000) {
      return NextResponse.json(
        { error: "Appointments cannot be scheduled in the past. Please select an upcoming date and time." },
        { status: 400 }
      );
    }

    const isStaff = ["ADMIN", "DEVELOPER", "FINANCE"].includes(session.user.role ?? "");

    // Determine who is requesting and who is assigned
    let requestedById = session.user.id;
    let assignedStaff = assignedStaffId || null;
    let initialStatus = "REQUESTED";

    if (isStaff) {
      if (clientId) {
        requestedById = clientId;
        assignedStaff = session.user.id;
      }
      initialStatus = status || "SCHEDULED";
    }

    const appointment = await prisma.appointment.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        date: appointmentDate,
        duration: Number(duration) || 30,
        status: initialStatus,
        meetingLink: meetingLink?.trim() || null,
        requestedById,
        assignedStaffId: assignedStaff,
      },
      include: {
        requestedBy: {
          select: { id: true, name: true, email: true, image: true },
        },
        assignedStaff: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({ success: true, appointment });
  } catch (err) {
    console.error("[Appointments POST error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create appointment" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/appointments
 * - Admin/Staff: Confirm, reschedule, add meeting link, or update status
 * - Client: Cancel their own requested appointment
 */
export async function PATCH(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, date, duration, meetingLink, notes, assignedStaffId } = body;

    if (!id) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 });
    }

    const existing = await prisma.appointment.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const isStaff = ["ADMIN", "DEVELOPER", "FINANCE"].includes(session.user.role ?? "");

    if (!isStaff) {
      // Client can only cancel their own appointment
      if (existing.requestedById !== session.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (status && status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Clients may only request cancellation of appointments." },
          { status: 403 }
        );
      }
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink?.trim() || null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (assignedStaffId !== undefined) updateData.assignedStaffId = assignedStaffId || null;
    if (duration !== undefined) updateData.duration = Number(duration) || 30;
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        updateData.date = parsedDate;
      }
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        requestedBy: {
          select: { id: true, name: true, email: true, image: true },
        },
        assignedStaff: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({ success: true, appointment: updated });
  } catch (err) {
    console.error("[Appointments PATCH error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update appointment" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments
 * Admin only: delete appointment
 */
export async function DELETE(request: Request) {
  const session = await getCurrentSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 });
  }

  try {
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Appointment deleted" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete appointment" },
      { status: 500 }
    );
  }
}
