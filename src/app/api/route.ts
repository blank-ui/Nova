import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    name: "Nova Platform API",
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      discordInteractions: "/api/discord/interactions",
      inquiries: "/api/inquiries",
      github: "/api/github",
      userDiscord: "/api/user/discord",
    },
    documentation: "https://nova.allskyfares.com",
  });
}
