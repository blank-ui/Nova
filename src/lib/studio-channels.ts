import { prisma } from "@/lib/prisma";

export interface StudioChannelRecord {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MemberRecord {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
}

const DEFAULT_CHANNELS = [
  {
    id: "sc-gen",
    slug: "general",
    name: "general-studio",
    description: "Studio-wide announcements, syncs, and team collaboration",
    icon: "Hash",
  },
  {
    id: "sc-eng",
    slug: "engineering",
    name: "engineering-sprint",
    description: "Technical architecture, sprint tasks, code reviews, and deployments",
    icon: "Terminal",
  },
  {
    id: "sc-fin",
    slug: "finance",
    name: "finance-billing",
    description: "Commercial scopes, invoicing, milestone valuations, and client budgets",
    icon: "DollarSign",
  },
];

async function ensureTableAndDefaults() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS StudioChannel (
        id VARCHAR(191) PRIMARY KEY,
        slug VARCHAR(191) UNIQUE NOT NULL,
        name VARCHAR(191) NOT NULL,
        description TEXT,
        icon VARCHAR(50) DEFAULT 'Hash',
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ChannelMember (
        id VARCHAR(191) PRIMARY KEY,
        channelId VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        role VARCHAR(50) DEFAULT 'MEMBER',
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        UNIQUE KEY ChannelMember_channelId_userId (channelId, userId)
      )
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ProjectMember (
        id VARCHAR(191) PRIMARY KEY,
        projectId VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        role VARCHAR(50) DEFAULT 'COLLABORATOR',
        createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
        UNIQUE KEY ProjectMember_projectId_userId (projectId, userId)
      )
    `);

    // Ensure defaults exist
    for (const ch of DEFAULT_CHANNELS) {
      await prisma.$executeRawUnsafe(
        `INSERT IGNORE INTO StudioChannel (id, slug, name, description, icon) VALUES (?, ?, ?, ?, ?)`,
        ch.id,
        ch.slug,
        ch.name,
        ch.description,
        ch.icon
      );
    }
  } catch (err) {
    console.error("Failed to ensure tables:", err);
  }
}

export async function getStudioChannels(): Promise<StudioChannelRecord[]> {
  await ensureTableAndDefaults();
  try {
    const rows = (await prisma.$queryRawUnsafe(
      `SELECT * FROM StudioChannel ORDER BY createdAt ASC`
    )) as any[];

    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      description: r.description || null,
      icon: r.icon || "Hash",
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }));
  } catch (err) {
    console.error("Error querying StudioChannel table, falling back to defaults:", err);
    return DEFAULT_CHANNELS.map((ch) => ({
      ...ch,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}

export async function createStudioChannel(data: {
  name: string;
  description?: string;
  icon?: string;
}): Promise<StudioChannelRecord> {
  await ensureTableAndDefaults();

  const trimmedName = data.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");
  if (!trimmedName) {
    throw new Error("Channel name is required and must contain alphanumeric characters.");
  }

  const slug = trimmedName.startsWith("#") ? trimmedName.slice(1) : trimmedName;
  const id = `sc-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const description = data.description?.trim() || "";
  const icon = data.icon || "Hash";

  // Check if slug already exists
  const existing = (await prisma.$queryRawUnsafe(
    `SELECT id FROM StudioChannel WHERE slug = ? LIMIT 1`,
    slug
  )) as any[];

  if (existing && existing.length > 0) {
    throw new Error(`Channel #${slug} already exists.`);
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO StudioChannel (id, slug, name, description, icon) VALUES (?, ?, ?, ?, ?)`,
    id,
    slug,
    trimmedName,
    description,
    icon
  );

  return {
    id,
    slug,
    name: trimmedName,
    description: description || null,
    icon,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function updateStudioChannel(data: {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}): Promise<StudioChannelRecord> {
  await ensureTableAndDefaults();

  const trimmedName = data.name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");
  if (!trimmedName) {
    throw new Error("Channel name is required.");
  }
  const slug = trimmedName.startsWith("#") ? trimmedName.slice(1) : trimmedName;
  const description = data.description?.trim() || "";
  const icon = data.icon || "Hash";

  // Prevent renaming 'general' slug to ensure fallback consistency
  const current = (await prisma.$queryRawUnsafe(
    `SELECT * FROM StudioChannel WHERE id = ? LIMIT 1`,
    data.id
  )) as any[];

  if (!current || current.length === 0) {
    throw new Error("Channel not found.");
  }

  const targetSlug = current[0].slug === "general" ? "general" : slug;

  await prisma.$executeRawUnsafe(
    `UPDATE StudioChannel SET slug = ?, name = ?, description = ?, icon = ?, updatedAt = NOW() WHERE id = ?`,
    targetSlug,
    trimmedName,
    description,
    icon,
    data.id
  );

  return {
    id: data.id,
    slug: targetSlug,
    name: trimmedName,
    description: description || null,
    icon,
    createdAt: new Date(current[0].createdAt).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteStudioChannel(id: string): Promise<boolean> {
  await ensureTableAndDefaults();

  const current = (await prisma.$queryRawUnsafe(
    `SELECT slug FROM StudioChannel WHERE id = ? LIMIT 1`,
    id
  )) as any[];

  if (!current || current.length === 0) {
    throw new Error("Channel not found.");
  }

  if (current[0].slug === "general") {
    throw new Error("The default #general-studio channel cannot be deleted.");
  }

  await prisma.$executeRawUnsafe(`DELETE FROM ChannelMember WHERE channelId = ?`, id);
  await prisma.$executeRawUnsafe(`DELETE FROM StudioChannel WHERE id = ?`, id);
  return true;
}

// -------------------------------------------------------------
// CHANNEL MEMBERS (Add, Remove, Get)
// -------------------------------------------------------------

export async function getChannelMembers(channelId: string): Promise<MemberRecord[]> {
  await ensureTableAndDefaults();

  // Find channel id by id or slug
  const chRows = (await prisma.$queryRawUnsafe(
    `SELECT id FROM StudioChannel WHERE id = ? OR slug = ? LIMIT 1`,
    channelId,
    channelId
  )) as any[];

  if (!chRows || chRows.length === 0) return [];
  const targetId = chRows[0].id;

  const members = (await prisma.$queryRawUnsafe(
    `SELECT cm.id, cm.userId, cm.role, u.name, u.email, u.role as userRole, u.image 
     FROM ChannelMember cm
     INNER JOIN User u ON cm.userId = u.id
     WHERE cm.channelId = ?`,
    targetId
  )) as any[];

  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    user: {
      id: m.userId,
      name: m.name,
      email: m.email,
      role: m.userRole,
      image: m.image,
    },
  }));
}

export async function addChannelMember(
  channelId: string,
  userId: string,
  role = "MEMBER"
): Promise<boolean> {
  await ensureTableAndDefaults();

  const chRows = (await prisma.$queryRawUnsafe(
    `SELECT id FROM StudioChannel WHERE id = ? OR slug = ? LIMIT 1`,
    channelId,
    channelId
  )) as any[];

  if (!chRows || chRows.length === 0) throw new Error("Channel not found.");
  const targetId = chRows[0].id;
  const id = `cm-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  await prisma.$executeRawUnsafe(
    `INSERT INTO ChannelMember (id, channelId, userId, role) 
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE role = VALUES(role)`,
    id,
    targetId,
    userId,
    role
  );

  return true;
}

export async function removeChannelMember(channelId: string, userId: string): Promise<boolean> {
  await ensureTableAndDefaults();

  const chRows = (await prisma.$queryRawUnsafe(
    `SELECT id FROM StudioChannel WHERE id = ? OR slug = ? LIMIT 1`,
    channelId,
    channelId
  )) as any[];

  if (!chRows || chRows.length === 0) throw new Error("Channel not found.");
  const targetId = chRows[0].id;

  await prisma.$executeRawUnsafe(
    `DELETE FROM ChannelMember WHERE channelId = ? AND userId = ?`,
    targetId,
    userId
  );

  return true;
}

// -------------------------------------------------------------
// PROJECT MEMBERS & THREAD UPDATE (Add, Remove, Get, Update)
// -------------------------------------------------------------

export async function getProjectMembers(projectId: string): Promise<{
  client: any;
  members: MemberRecord[];
}> {
  await ensureTableAndDefaults();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: {
        select: { id: true, name: true, email: true, role: true, image: true },
      },
    },
  });

  if (!project) throw new Error("Project not found.");

  const memberRows = (await prisma.$queryRawUnsafe(
    `SELECT pm.id, pm.userId, pm.role, u.name, u.email, u.role as userRole, u.image 
     FROM ProjectMember pm
     INNER JOIN User u ON pm.userId = u.id
     WHERE pm.projectId = ?`,
    projectId
  )) as any[];

  const members: MemberRecord[] = memberRows.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    user: {
      id: m.userId,
      name: m.name,
      email: m.email,
      role: m.userRole,
      image: m.image,
    },
  }));

  return {
    client: project.client,
    members,
  };
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  role = "COLLABORATOR"
): Promise<boolean> {
  await ensureTableAndDefaults();

  const id = `pm-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  await prisma.$executeRawUnsafe(
    `INSERT INTO ProjectMember (id, projectId, userId, role) 
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE role = VALUES(role)`,
    id,
    projectId,
    userId,
    role
  );

  return true;
}

export async function removeProjectMember(projectId: string, userId: string): Promise<boolean> {
  await ensureTableAndDefaults();

  await prisma.$executeRawUnsafe(
    `DELETE FROM ProjectMember WHERE projectId = ? AND userId = ?`,
    projectId,
    userId
  );

  return true;
}

export async function updateProjectDetails(
  projectId: string,
  data: {
    name?: string;
    description?: string;
    status?: any;
  }
) {
  const updateData: any = {};
  if (data.name && data.name.trim()) updateData.name = data.name.trim();
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status) updateData.status = data.status;

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: updateData,
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      updatedAt: true,
    },
  });

  return updated;
}
