import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-guards";
import { getAuthorizedProject } from "@/lib/project-access";
import { updateProjectDetails } from "@/lib/studio-channels";

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

  return NextResponse.json({ project });
}

export async function PUT(request: Request, { params }: RouteParams) {
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
    const updated = await updateProjectDetails(projectId, {
      name: body.name,
      description: body.description,
      status: body.status,
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update project" },
      { status: 400 }
    );
  }
}
