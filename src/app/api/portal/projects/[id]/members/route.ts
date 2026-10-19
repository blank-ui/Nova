import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-guards";
import { getAuthorizedProject } from "@/lib/project-access";
import {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from "@/lib/studio-channels";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id: projectId } = await params;
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await getAuthorizedProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const data = await getProjectMembers(projectId);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load project members" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id: projectId } = await params;
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await getAuthorizedProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { userId, role } = body;
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await addProjectMember(projectId, userId, role || "COLLABORATOR");
    const updated = await getProjectMembers(projectId);
    return NextResponse.json({ success: true, ...updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to add project member" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id: projectId } = await params;
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await getAuthorizedProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");

    if (!userId) {
      const body = await request.json().catch(() => null);
      userId = body?.userId;
    }

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await removeProjectMember(projectId, userId);
    const updated = await getProjectMembers(projectId);
    return NextResponse.json({ success: true, ...updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to remove project member" },
      { status: 400 }
    );
  }
}
