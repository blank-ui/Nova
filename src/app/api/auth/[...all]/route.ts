import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const handler = toNextJsHandler(auth);

export async function GET(req: Request) {
  try {
    return await handler.GET(req);
  } catch (error) {
    console.error("Better Auth GET error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Authentication error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    return await handler.POST(req);
  } catch (error) {
    console.error("Better Auth POST error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Authentication error",
      },
      { status: 500 }
    );
  }
}
