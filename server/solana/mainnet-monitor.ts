/**
 * Solana Mainnet Transaction Monitor
 * Real-time monitoring of treasury transactions using Helius RPC
 */

import { Connection, PublicKey } from "@solana/web3.js";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import { transactions, auditLogs, type InsertAuditLog } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";

interface TransactionInfo {
  signature: string;
  blockTime: number;
  type: "token_transfer" | "sol_transfer" | "program_interaction" | "unknown";
  amount?: number | string;
  source?: string;
  destination?: string;
  success: boolean;
}

class MainnetMonitor {
  private connection: Connection;
  private treasuryAddress: string;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastProcessedSlot: number = 0;
  private transactionCount: number = 0;
  private rpcEndpoint: string;

  constructor() {
    // Use Helius RPC endpoint with API key
    this.rpcEndpoint = `https://mainnet.helius-rpc.com/?api-key=${ENV.heliusApiKey}`;
    this.connection = new Connection(this.rpcEndpoint, "confirmed");
    this.treasuryAddress = ENV.treasuryPubkey;
  }

  /**
   * Start monitoring treasury transactions
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log("[MainnetMonitor] Already monitoring");
      return;
    }

    this.isMonitoring = true;
    console.log(`[MainnetMonitor] Starting to monitor treasury: ${this.treasuryAddress}`);

    // Poll for new transactions every 3 seconds
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkNewTransactions();
      } catch (error) {
        console.error("[MainnetMonitor] Error checking transactions:", error);
      }
    }, 3000);

    console.log("[MainnetMonitor] Monitoring started");
  }

  /**
   * Check for new transactions on treasury
   */
  private async checkNewTransactions(): Promise<void> {
    try {
      const treasuryPubkey = new PublicKey(this.treasuryAddress);

      // Get recent transactions
      const signatures = await this.connection.getSignaturesForAddress(treasuryPubkey, {
        limit: 10,
      });

      if (!signatures || signatures.length === 0) {
        return;
      }

      // Process new transactions
      for (const sigInfo of signatures) {
        const blockTime = Number(sigInfo.blockTime) || 0;
        if (blockTime && blockTime > this.lastProcessedSlot) {
          try {
            const txData = await this.connection.getParsedTransaction(sigInfo.signature, "confirmed");

            if (txData) {
              const txInfo = this.parseTransaction(txData, sigInfo.signature);
              await this.recordTransaction(txInfo);
              this.lastProcessedSlot = sigInfo.blockTime || 0;
              this.transactionCount++;

              // Notify on significant transactions
              if (txInfo.amount && Number(txInfo.amount) > 1000) {
                await notifyOwner({
                  title: "💰 Large Treasury Transaction Detected",
                  content: `${txInfo.type}: ${txInfo.amount} SOL\nSignature: ${txInfo.signature}`,
                });
              }
            }
          } catch (error) {
            console.error(`[MainnetMonitor] Error processing transaction ${sigInfo.signature}:`, error);
          }
        }
      }
    } catch (error) {
      console.error("[MainnetMonitor] Error fetching transactions:", error);
    }
  }

  /**
   * Parse transaction data
   */
  private parseTransaction(tx: any, signature: string): TransactionInfo {
    const info: TransactionInfo = {
      signature,
      blockTime: tx.blockTime || Math.floor(Date.now() / 1000),
      type: "unknown",
      success: !tx.meta?.err,
    };

    // Parse instructions to determine transaction type
    if (tx.transaction?.message?.instructions && tx.transaction.message.instructions.length > 0) {
      const instruction = tx.transaction.message.instructions[0];

      if ("parsed" in instruction && instruction.parsed) {
        const parsed = instruction.parsed;

        if ("type" in parsed) {
          if (parsed.type === "transfer") {
            info.type = "sol_transfer";
            if ("info" in parsed && parsed.info) {
              const info_obj = parsed.info as any;
              info.amount = (info_obj.lamports || 0) / 1e9;
              info.source = info_obj.source;
              info.destination = info_obj.destination;
            }
          } else if (parsed.type === "transferChecked") {
            info.type = "token_transfer";
            if ("info" in parsed && parsed.info) {
              const info_obj = parsed.info as any;
              info.amount = info_obj.tokenAmount?.uiAmount;
              info.source = info_obj.source;
              info.destination = info_obj.destination;
            }
          }
        }
      }
    }

    if (info.type === "unknown") {
      info.type = "program_interaction";
    }

    return info;
  }

  /**
   * Record transaction in database
   */
  private async recordTransaction(txInfo: TransactionInfo): Promise<void> {
    const db = await getDb();
    if (!db) return;

    try {
      const txMetadata = {
        rpcEndpoint: this.rpcEndpoint,
        monitoredAt: new Date().toISOString(),
      };

      await db.insert(transactions).values({
        signature: txInfo.signature,
        blockTime: Number(txInfo.blockTime),
        type: txInfo.type,
        amount: String(txInfo.amount || 0),
        status: txInfo.success ? "confirmed" : "failed",
        details: txMetadata,
      });

      const auditEntry: InsertAuditLog = {
        event: "transaction_recorded",
        severity: "INFO",
        actor: "mainnet_monitor",
        details: txInfo as any,
      };

      await db.insert(auditLogs).values(auditEntry);
    } catch (error) {
      console.error("[MainnetMonitor] Error recording transaction:", error);
    }
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log("[MainnetMonitor] Monitoring stopped");
  }

  /**
   * Get monitoring statistics
   */
  getStats() {
    return {
      isMonitoring: this.isMonitoring,
      treasuryAddress: this.treasuryAddress,
      rpcEndpoint: this.rpcEndpoint,
      transactionCount: this.transactionCount,
      lastProcessedBlockTime: this.lastProcessedSlot,
    };
  }
}

let monitor: MainnetMonitor | null = null;

export function getMainnetMonitor(): MainnetMonitor {
  if (!monitor) {
    monitor = new MainnetMonitor();
  }
  return monitor;
}

export { MainnetMonitor, TransactionInfo };
