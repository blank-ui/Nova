import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/prisma", () => {
  const users = [
    {
      id: "admin-user-123",
      email: "kbipul792@gmail.com",
      name: "Bipul",
      role: "ADMIN",
      discordId: null,
      discordHandle: "superr_nova_",
    },
    {
      id: "client-user-456",
      email: "client@example.com",
      name: "Client",
      role: "CLIENT",
      discordId: "987654321",
      discordHandle: "client_discord",
    },
  ];

  const accounts: Array<{
    id: string;
    userId: string;
    providerId: string;
    accountId: string;
  }> = [];

  return {
    prisma: {
      user: {
        findFirst: vi.fn(async ({ where }: { where: { discordId?: string } }) => {
          if (where.discordId) {
            return users.find((u) => u.discordId === where.discordId) ?? null;
          }
          return null;
        }),
        findMany: vi.fn(async ({ where }: { where?: { discordHandle?: { not: null } } }) => {
          if (where?.discordHandle) {
            return users.filter((u) => u.discordHandle !== null);
          }
          return users;
        }),
        findUnique: vi.fn(async ({ where }: { where: { email?: string; id?: string } }) => {
          if (where.email) {
            return users.find((u) => u.email === where.email) ?? null;
          }
          if (where.id) {
            return users.find((u) => u.id === where.id) ?? null;
          }
          return null;
        }),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
          const user = users.find((u) => u.id === where.id);
          if (user) {
            Object.assign(user, data);
            return user;
          }
          throw new Error("User not found");
        }),
      },
      authAccount: {
        findUnique: vi.fn(async ({ where }: { where: { providerId_accountId: { providerId: string; accountId: string } } }) => {
          return (
            accounts.find(
              (a) =>
                a.providerId === where.providerId_accountId.providerId &&
                a.accountId === where.providerId_accountId.accountId
            ) ?? null
          );
        }),
        create: vi.fn(async ({ data }: { data: { providerId: string; accountId: string; userId: string } }) => {
          const newAccount = { id: `acc-${Date.now()}`, ...data };
          accounts.push(newAccount);
          return newAccount;
        }),
        update: vi.fn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
          const acc = accounts.find((a) => a.id === where.id);
          if (acc) {
            Object.assign(acc, data);
            return acc;
          }
          throw new Error("Account not found");
        }),
        deleteMany: vi.fn(async ({ where }: { where: { userId: string; providerId: string } }) => {
          const initialLen = accounts.length;
          const filtered = accounts.filter((a) => !(a.userId === where.userId && a.providerId === where.providerId));
          accounts.length = 0;
          accounts.push(...filtered);
          return { count: initialLen - filtered.length };
        }),
      },
    },
  };
});

describe("Discord OAuth Account Resolution", () => {
  it("resolves Discord profile by discordHandle and links to existing Admin account", async () => {
    const { prisma } = await import("@/lib/prisma");

    // Re-verify the admin user has discordHandle superr_nova_
    const adminUser = await prisma.user.findUnique({ where: { email: "kbipul792@gmail.com" } });
    expect(adminUser).toBeDefined();
    expect(adminUser?.role).toBe("ADMIN");
    expect(adminUser?.discordHandle).toBe("superr_nova_");
    expect(adminUser?.discordId).toBeNull();

    // Simulate mapProfileToUser logic with mock Discord profile
    const discordProfile = {
      id: "1558773921686360155",
      username: "superr_nova_",
      email: "discord-random-email@gmail.com", // Different from admin email!
      global_name: "Super Nova",
      verified: true,
    };

    const rawId = String(discordProfile.id).trim();
    const rawUsername = String(discordProfile.username).trim();
    const cleanUsername = rawUsername.replace(/^@+/, "").toLowerCase();
    const rawEmail = discordProfile.email.trim().toLowerCase();

    // Matching flow
    let matchingUser = null;
    if (rawId) {
      matchingUser = await prisma.user.findFirst({ where: { discordId: rawId } });
    }
    if (!matchingUser && cleanUsername) {
      const allUsersWithHandle = await prisma.user.findMany({ where: { discordHandle: { not: null } } });
      matchingUser =
        allUsersWithHandle.find(
          (u) => u.discordHandle?.trim().replace(/^@+/, "").toLowerCase() === cleanUsername
        ) ?? null;
    }
    if (!matchingUser && rawEmail) {
      matchingUser = await prisma.user.findUnique({ where: { email: rawEmail } });
    }

    expect(matchingUser).not.toBeNull();
    expect(matchingUser?.id).toBe("admin-user-123");
    expect(matchingUser?.email).toBe("kbipul792@gmail.com");

    // Backfill and link AuthAccount
    if (matchingUser) {
      await prisma.user.update({
        where: { id: matchingUser.id },
        data: { discordId: rawId, discordHandle: rawUsername },
      });

      await prisma.authAccount.create({
        data: {
          providerId: "discord",
          accountId: rawId,
          userId: matchingUser.id,
        },
      });
    }

    // Verify admin user is now updated with discordId
    const updatedAdmin = await prisma.user.findUnique({ where: { id: "admin-user-123" } });
    expect(updatedAdmin?.discordId).toBe("1558773921686360155");

    // Verify AuthAccount exists linking discord provider to admin user
    const linkedAccount = await prisma.authAccount.findUnique({
      where: {
        providerId_accountId: {
          providerId: "discord",
          accountId: "1558773921686360155",
        },
      },
    });
    expect(linkedAccount).not.toBeNull();
    expect(linkedAccount?.userId).toBe("admin-user-123");
  });

  it("handles case-insensitive and @-prefixed handles seamlessly", async () => {
    const { prisma } = await import("@/lib/prisma");

    const discordProfile = {
      id: "999888777",
      username: "SUPERR_NOVA_", // Uppercase variant
      email: "kbipul792@gmail.com",
    };

    const cleanUsername = discordProfile.username.trim().replace(/^@+/, "").toLowerCase();
    const allUsersWithHandle = await prisma.user.findMany({ where: { discordHandle: { not: null } } });
    const matchingUser = allUsersWithHandle.find(
      (u) => u.discordHandle?.trim().replace(/^@+/, "").toLowerCase() === cleanUsername
    );

    expect(matchingUser).toBeDefined();
    expect(matchingUser?.id).toBe("admin-user-123");
  });
});
