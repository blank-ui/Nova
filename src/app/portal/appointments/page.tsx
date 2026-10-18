import { requireClient } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { AppointmentsManager } from "@/components/appointments-manager";

export default async function PortalAppointmentsPage() {
  const session = await requireClient();

  const appointments = await prisma.appointment.findMany({
    where: {
      OR: [
        { requestedById: session.user.id },
        { assignedStaffId: session.user.id },
      ],
    },
    orderBy: { date: "asc" },
    include: {
      requestedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      assignedStaff: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  const serialized = appointments.map((a) => ({
    ...a,
    date: a.date.toISOString(),
  }));

  return (
    <div style={{ width: "100%" }}>
      <AppointmentsManager
        initialAppointments={serialized}
        currentUserId={session.user.id}
        currentUserRole={session.user.role ?? "CLIENT"}
      />
    </div>
  );
}
