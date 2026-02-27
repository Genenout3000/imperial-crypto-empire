import { eq, desc, and, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  programs,
  vaults,
  agents,
  agentMetrics,
  transactions,
  auditLogs,
  notifications,
  InsertProgram,
  InsertVault,
  InsertAgent,
  InsertAgentMetric,
  InsertTransaction,
  InsertAuditLog,
  InsertNotification,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ PROGRAM OPERATIONS ============

export async function upsertProgram(program: InsertProgram) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .insert(programs)
    .values(program)
    .onDuplicateKeyUpdate({
      set: {
        name: program.name,
        description: program.description,
        currentVersion: program.currentVersion,
        latestVersion: program.latestVersion,
        bytecodeHash: program.bytecodeHash,
        status: program.status,
        isVerified: program.isVerified,
        lastScanned: new Date(),
        updatedAt: new Date(),
      },
    });
}

export async function getPrograms() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(programs).orderBy(desc(programs.updatedAt));
}

export async function getProgramById(programId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(programs)
    .where(eq(programs.programId, programId))
    .limit(1);

  return result[0];
}

export async function getProgramsNeedingUpgrade() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(programs).where(eq(programs.status, "needs_upgrade"));
}

// ============ VAULT OPERATIONS ============

export async function upsertVault(vault: InsertVault) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .insert(vaults)
    .values(vault)
    .onDuplicateKeyUpdate({
      set: {
        collateralAmount: vault.collateralAmount,
        debtAmount: vault.debtAmount,
        ltv: vault.ltv,
        healthRatio: vault.healthRatio,
        status: vault.status,
        updatedAt: new Date(),
      },
    });
}

export async function getVaults() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(vaults).orderBy(desc(vaults.updatedAt));
}

export async function getVaultsByOwner(owner: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(vaults).where(eq(vaults.owner, owner));
}

export async function getVaultsAtRisk() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(vaults)
    .where(and(eq(vaults.status, "active"), gte(vaults.ltv, "0.80")));
}

// ============ AGENT OPERATIONS ============

export async function upsertAgent(agent: InsertAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .insert(agents)
    .values(agent)
    .onDuplicateKeyUpdate({
      set: {
        status: agent.status,
        balance: agent.balance,
        totalEarned: agent.totalEarned,
        totalLost: agent.totalLost,
        winRate: agent.winRate,
        lastLoopAt: agent.lastLoopAt,
        updatedAt: new Date(),
      },
    });
}

export async function getAgents() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.select().from(agents).orderBy(desc(agents.updatedAt));
}

export async function getAgentByName(name: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.name, name))
    .limit(1);

  return result[0];
}

export async function insertAgentMetric(metric: InsertAgentMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(agentMetrics).values(metric);
}

export async function getAgentMetrics(agentId: number, limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(agentMetrics)
    .where(eq(agentMetrics.agentId, agentId))
    .orderBy(desc(agentMetrics.loopNumber))
    .limit(limit);
}

// ============ TRANSACTION OPERATIONS ============

export async function insertTransaction(tx: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(transactions).values(tx);
}

export async function getTransactions(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function getTransactionBySignature(signature: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.signature, signature))
    .limit(1);

  return result[0];
}

// ============ AUDIT LOG OPERATIONS ============

export async function insertAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(auditLogs).values(log);
}

export async function getAuditLogs(limit = 100) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

// ============ NOTIFICATION OPERATIONS ============

export async function insertNotification(notif: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(notifications).values(notif);
}

export async function getNotifications(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(notifications)
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));
}
