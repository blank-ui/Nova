import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { safeInternalPath, getAppBaseUrl } from "@/lib/safe-redirect";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const baseUrl = getAppBaseUrl(request);
  const url = new URL(request.url);
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.redirect(new URL("/login?error=signin", baseUrl));
  }

  const requested = safeInternalPath(url.searchParams.get("next"), "/portal");

  if (session.user.role === "ADMIN") {
    const adminTarget =
      requested.startsWith("/admin") && !requested.includes("setup=required") ? requested : "/admin";
    return NextResponse.redirect(new URL(adminTarget, baseUrl));
  }

  if (session.user.role === "DEVELOPER") {
    const devTarget = requested.startsWith("/developer") ? requested : "/developer";
    return NextResponse.redirect(new URL(devTarget, baseUrl));
  }

  if (session.user.role === "FINANCE") {
    const finTarget = requested.startsWith("/finance") ? requested : "/finance";
    return NextResponse.redirect(new URL(finTarget, baseUrl));
  }

  return NextResponse.redirect(new URL(requested.startsWith("/admin") ? "/portal" : requested, baseUrl));
}
