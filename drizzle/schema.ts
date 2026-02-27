import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  boolean,
  bigint,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Solana Programs discovered and managed by the platform
 */
export const programs = mysqlTable("programs", {
  id: int("id").autoincrement().primaryKey(),
  programId: varchar("programId", { length: 88 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  owner: varchar("owner", { length: 88 }).notNull(),
  currentVersion: varchar("currentVersion", { length: 64 }),
  latestVersion: varchar("latestVersion", { length: 64 }),
  bytecodeHash: varchar("bytecodeHash", { length: 128 }),
  status: mysqlEnum("status", ["active", "inactive", "deprecated", "needs_upgrade"]).default("active"),
  isVerified: boolean("isVerified").default(false),
  lastScanned: timestamp("lastScanned"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Program = typeof programs.$inferSelect;
export type InsertProgram = typeof programs.$inferInsert;

/**
 * Program upgrades and deployment history
 */
export const programUpgrades = mysqlTable("programUpgrades", {
  id: int("id").autoincrement().primaryKey(),
  programId: varchar("programId", { length: 88 }).notNull(),
  fromVersion: varchar("fromVersion", { length: 64 }).notNull(),
  toVersion: varchar("toVersion", { length: 64 }).notNull(),
  transactionSignature: varchar("transactionSignature", { length: 128 }),
  status: mysqlEnum("status", ["proposed", "approved", "deployed", "failed"]).default("proposed"),
  reason: text("reason"),
  deployedAt: timestamp("deployedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProgramUpgrade = typeof programUpgrades.$inferSelect;
export type InsertProgramUpgrade = typeof programUpgrades.$inferInsert;

/**
 * Jupiter Lend Vaults for yield farming and borrowing
 */
export const vaults = mysqlTable("vaults", {
  id: int("id").autoincrement().primaryKey(),
  vaultId: varchar("vaultId", { length: 88 }).notNull().unique(),
  owner: varchar("owner", { length: 88 }).notNull(),
  vaultType: mysqlEnum("vaultType", ["earn", "borrow"]).notNull(),
  collateralMint: varchar("collateralMint", { length: 88 }),
  collateralAmount: decimal("collateralAmount", { precision: 24, scale: 8 }),
  debtMint: varchar("debtMint", { length: 88 }),
  debtAmount: decimal("debtAmount", { precision: 24, scale: 8 }),
  ltv: decimal("ltv", { precision: 5, scale: 2 }),
  healthRatio: decimal("healthRatio", { precision: 10, scale: 4 }),
  status: mysqlEnum("status", ["active", "liquidated", "closed"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vault = typeof vaults.$inferSelect;
export type InsertVault = typeof vaults.$inferInsert;

/**
 * Autonomous Agent Loops (Paul & Ralph)
 */
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["paul", "ralph"]).notNull(),
  strategy: varchar("strategy", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["running", "paused", "stopped", "error"]).default("stopped"),
  publicKey: varchar("publicKey", { length: 88 }).notNull(),
  balance: decimal("balance", { precision: 24, scale: 8 }),
  totalEarned: decimal("totalEarned", { precision: 24, scale: 8 }).default("0"),
  totalLost: decimal("totalLost", { precision: 24, scale: 8 }).default("0"),
  winRate: decimal("winRate", { precision: 5, scale: 2 }).default("0"),
  lastLoopAt: timestamp("lastLoopAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Agent Performance Metrics and Learning Data
 */
export const agentMetrics = mysqlTable("agentMetrics", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  loopNumber: int("loopNumber").notNull(),
  strategyUsed: varchar("strategyUsed", { length: 255 }).notNull(),
  transactionsExecuted: int("transactionsExecuted").default(0),
  profitLoss: decimal("profitLoss", { precision: 24, scale: 8 }),
  gasUsed: decimal("gasUsed", { precision: 24, scale: 8 }),
  executionTime: int("executionTime"),
  successRate: decimal("successRate", { precision: 5, scale: 2 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentMetric = typeof agentMetrics.$inferSelect;
export type InsertAgentMetric = typeof agentMetrics.$inferInsert;

/**
 * Pentacle Bot Swarm Coordination
 */
export const botSwarms = mysqlTable("botSwarms", {
  id: int("id").autoincrement().primaryKey(),
  swarmId: varchar("swarmId", { length: 88 }).notNull().unique(),
  commander: varchar("commander", { length: 88 }).notNull(),
  botCount: int("botCount").default(5),
  status: mysqlEnum("status", ["active", "paused", "dormant"]).default("active"),
  totalMinted: decimal("totalMinted", { precision: 24, scale: 8 }).default("0"),
  totalLiquidity: decimal("totalLiquidity", { precision: 24, scale: 8 }).default("0"),
  lastExpansion: timestamp("lastExpansion"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BotSwarm = typeof botSwarms.$inferSelect;
export type InsertBotSwarm = typeof botSwarms.$inferInsert;

/**
 * Individual Bots in Swarms
 */
export const swarmBots = mysqlTable("swarmBots", {
  id: int("id").autoincrement().primaryKey(),
  swarmId: varchar("swarmId", { length: 88 }).notNull(),
  botIndex: int("botIndex").notNull(),
  botAddress: varchar("botAddress", { length: 88 }).notNull(),
  role: varchar("role", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["active", "idle", "error"]).default("idle"),
  lastAction: timestamp("lastAction"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SwarmBot = typeof swarmBots.$inferSelect;
export type InsertSwarmBot = typeof swarmBots.$inferInsert;

/**
 * Transaction History and Audit Trail
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  signature: varchar("signature", { length: 128 }).notNull().unique(),
  type: varchar("type", { length: 64 }).notNull(),
  initiator: varchar("initiator", { length: 88 }),
  relatedProgram: varchar("relatedProgram", { length: 88 }),
  relatedVault: varchar("relatedVault", { length: 88 }),
  relatedAgent: varchar("relatedAgent", { length: 64 }),
  amount: decimal("amount", { precision: 24, scale: 8 }),
  fee: decimal("fee", { precision: 24, scale: 8 }),
  status: mysqlEnum("status", ["pending", "confirmed", "failed"]).default("pending"),
  blockTime: bigint("blockTime", { mode: "number" }),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Audit Logs for Compliance and Analysis
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  event: varchar("event", { length: 255 }).notNull(),
  severity: mysqlEnum("severity", ["INFO", "WARNING", "ERROR", "CRITICAL"]).default("INFO"),
  actor: varchar("actor", { length: 88 }),
  details: json("details"),
  s3Key: varchar("s3Key", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Portfolio History for Performance Tracking
 */
export const portfolioHistory = mysqlTable("portfolioHistory", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  totalValue: decimal("totalValue", { precision: 24, scale: 8 }),
  totalYield: decimal("totalYield", { precision: 24, scale: 8 }),
  vaultPositions: json("vaultPositions"),
  agentBalances: json("agentBalances"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortfolioHistory = typeof portfolioHistory.$inferSelect;
export type InsertPortfolioHistory = typeof portfolioHistory.$inferInsert;

/**
 * Notifications and Alerts
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["info", "warning", "error", "success"]).default("info"),
  relatedProgram: varchar("relatedProgram", { length: 88 }),
  relatedVault: varchar("relatedVault", { length: 88 }),
  relatedAgent: varchar("relatedAgent", { length: 64 }),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;