import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// 1x1 transparent GIF
const TRANSPARENT_GIF_BYTES = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

/**
 * GET /api/auth/email-track?token=...&uid=...
 * Invisible tracking pixel embedded in account initiation emails.
 * Detects when the user opens/views the initiation email and marks `invitationSeenAt`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token")?.trim();
  const uid = searchParams.get("uid")?.trim();

  // Asynchronously record tracking in background
  (async () => {
    try {
      let targetUserId: string | null = uid || null;

      if (!targetUserId && token) {
        const verification = await prisma.authVerification.findFirst({
          where: { identifier: `reset-password:${token}` },
          select: { value: true },
        });
        if (verification?.value) {
          targetUserId = verification.value;
        }
      }

      if (targetUserId) {
        const existingUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { id: true, invitationSeenAt: true },
        });

        if (existingUser && !existingUser.invitationSeenAt) {
          await prisma.user.update({
            where: { id: targetUserId },
            data: { invitationSeenAt: new Date() },
          });
        }
      }
    } catch (err) {
      console.warn("[Email Track] Failed to register email open:", err);
    }
  })();

  // Immediately respond with 1x1 transparent image
  return new NextResponse(TRANSPARENT_GIF_BYTES, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": TRANSPARENT_GIF_BYTES.length.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}
