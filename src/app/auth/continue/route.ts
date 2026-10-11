import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeInternalPath } from "@/lib/safe-redirect";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.redirect(new URL("/login?error=signin", url));
  const requested = safeInternalPath(url.searchParams.get("next"), "/portal");
  if (session.user.role === "ADMIN") {
    const adminTarget = requested.startsWith("/admin") && !requested.includes("setup=required") ? requested : "/admin";
    return NextResponse.redirect(new URL(adminTarget, url));
  }
  return NextResponse.redirect(new URL(requested.startsWith("/admin") ? "/portal" : requested, url));
}
