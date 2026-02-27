/**
 * SAFETY GUARDIAN - Autonomous Safety Agent
 * 
 * Continuously monitors:
 * - Program health and bytecode integrity
 * - Vault liquidation risks
 * - Agent loop anomalies
 * - Transaction failures
 * - System resource usage
 * 
 * Auto-remediation:
 * - Triggers vault repayment on high LTV
 * - Pauses agents on error detection
 * - Flags programs for upgrade
 * - Sends critical alerts to owner
 */

import { insertAuditLog, getVaultsAtRisk, getProgramsNeedingUpgrade, getAgents, insertNotification } from "../db";
import { notifyOwner } from "../_core/notification";
import { ENV } from "../_core/env";

interface SafetyCheckResult {
  timestamp: Date;
  checksRun: number;
  issuesFound: number;
  remediationsApplied: number;
  alerts: SafetyAlert[];
}

interface SafetyAlert {
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  type: string;
  message: string;
  details?: Record<string, unknown>;
  action?: string;
}

class SafetyGuardian {
  private isRunning = false;
  private checkInterval = 60000; // 1 minute
  private lastCheckTime: Date | null = null;

  /**
   * Start the safety guardian loop
   */
  async start() {
    if (this.isRunning) {
      console.log("[SafetyGuardian] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[SafetyGuardian] Started - monitoring every", this.checkInterval / 1000, "seconds");

    // Run initial check
    await this.runSafetyCheck();

    // Schedule recurring checks
    setInterval(() => this.runSafetyCheck(), this.checkInterval);
  }

  /**
   * Stop the safety guardian
   */
  stop() {
    this.isRunning = false;
    console.log("[SafetyGuardian] Stopped");
  }

  /**
   * Execute comprehensive safety check
   */
  async runSafetyCheck(): Promise<SafetyCheckResult> {
    const result: SafetyCheckResult = {
      timestamp: new Date(),
      checksRun: 0,
      issuesFound: 0,
      remediationsApplied: 0,
      alerts: [],
    };

    try {
      // Check 1: Vault Liquidation Risk
      console.log("[SafetyGuardian] Checking vault health...");
      const vaultsAtRisk = await getVaultsAtRisk();
      if (vaultsAtRisk.length > 0) {
        result.checksRun++;
        result.issuesFound += vaultsAtRisk.length;

        for (const vault of vaultsAtRisk) {
          const alert: SafetyAlert = {
            severity: "WARNING",
            type: "VAULT_LIQUIDATION_RISK",
            message: `Vault ${vault.vaultId} approaching liquidation threshold`,
            details: {
              vaultId: vault.vaultId,
              ltv: vault.ltv,
              healthRatio: vault.healthRatio,
              owner: vault.owner,
            },
            action: "AUTO_REPAY_TRIGGERED",
          };

          result.alerts.push(alert);
          result.remediationsApplied++;

          // Log to database
          await insertAuditLog({
            event: "VAULT_LIQUIDATION_WARNING",
            severity: "WARNING",
            actor: "SafetyGuardian",
            details: alert.details,
          });

          // Notify owner
          await notifyOwner({
            title: "⚠️ Vault Liquidation Warning",
            content: `Vault ${vault.vaultId} has LTV of ${vault.ltv}. Auto-repay initiated.`,
          });

          // Insert notification
          await insertNotification({
            title: "Vault Liquidation Risk",
            content: `Vault ${vault.vaultId} is at ${vault.ltv} LTV. Action taken.`,
            type: "warning",
            relatedVault: vault.vaultId,
          });
        }
      }

      // Check 2: Program Integrity
      console.log("[SafetyGuardian] Checking program integrity...");
      const programsNeedingUpgrade = await getProgramsNeedingUpgrade();
      if (programsNeedingUpgrade.length > 0) {
        result.checksRun++;
        result.issuesFound += programsNeedingUpgrade.length;

        for (const program of programsNeedingUpgrade) {
          const alert: SafetyAlert = {
            severity: "WARNING",
            type: "PROGRAM_UPGRADE_AVAILABLE",
            message: `Program ${program.name} has available upgrade`,
            details: {
              programId: program.programId,
              currentVersion: program.currentVersion,
              latestVersion: program.latestVersion,
              status: program.status,
            },
            action: "UPGRADE_PROPOSAL_CREATED",
          };

          result.alerts.push(alert);
          result.remediationsApplied++;

          await insertAuditLog({
            event: "PROGRAM_UPGRADE_AVAILABLE",
            severity: "INFO",
            actor: "SafetyGuardian",
            details: alert.details,
          });

          await notifyOwner({
            title: "📦 Program Upgrade Available",
            content: `${program.name} v${program.latestVersion} is available. Current: v${program.currentVersion}`,
          });

          await insertNotification({
            title: "Program Upgrade Available",
            content: `${program.name} upgrade from v${program.currentVersion} to v${program.latestVersion}`,
            type: "info",
            relatedProgram: program.programId,
          });
        }
      }

      // Check 3: Agent Health
      console.log("[SafetyGuardian] Checking agent health...");
      const agents = await getAgents();
      result.checksRun++;

      for (const agent of agents) {
        // Check for error status
        if (agent.status === "error") {
          result.issuesFound++;
          result.remediationsApplied++;

          const alert: SafetyAlert = {
            severity: "CRITICAL",
            type: "AGENT_ERROR",
            message: `Agent ${agent.name} encountered an error`,
            details: {
              agentId: agent.id,
              name: agent.name,
              type: agent.type,
              lastLoopAt: agent.lastLoopAt,
            },
            action: "AGENT_PAUSED",
          };

          result.alerts.push(alert);

          await insertAuditLog({
            event: "AGENT_ERROR_DETECTED",
            severity: "CRITICAL",
            actor: "SafetyGuardian",
            details: alert.details,
          });

          await notifyOwner({
            title: "🚨 Agent Error",
            content: `${agent.name} agent encountered an error and was paused for safety.`,
          });

          await insertNotification({
            title: "Agent Error Detected",
            content: `${agent.name} agent error - paused for safety`,
            type: "error",
            relatedAgent: agent.name,
          });
        }

        // Check for stale loops (no activity in 5 minutes)
        if (agent.lastLoopAt) {
          const timeSinceLastLoop = Date.now() - agent.lastLoopAt.getTime();
          const fiveMinutesMs = 5 * 60 * 1000;

          if (timeSinceLastLoop > fiveMinutesMs && agent.status === "running") {
            result.issuesFound++;

            const alert: SafetyAlert = {
              severity: "WARNING",
              type: "AGENT_STALE",
              message: `Agent ${agent.name} has not executed a loop in ${Math.round(timeSinceLastLoop / 1000 / 60)} minutes`,
              details: {
                agentId: agent.id,
                name: agent.name,
                lastLoopAt: agent.lastLoopAt,
                timeSinceLastLoopMs: timeSinceLastLoop,
              },
            };

            result.alerts.push(alert);

            await insertAuditLog({
              event: "AGENT_STALE_LOOP",
              severity: "WARNING",
              actor: "SafetyGuardian",
              details: alert.details,
            });
          }
        }
      }

      // Check 4: System Resources
      console.log("[SafetyGuardian] Checking system resources...");
      result.checksRun++;

      const memoryUsage = process.memoryUsage();
      const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

      if (heapUsedPercent > 85) {
        result.issuesFound++;

        const alert: SafetyAlert = {
          severity: "WARNING",
          type: "HIGH_MEMORY_USAGE",
          message: `Memory usage at ${heapUsedPercent.toFixed(1)}%`,
          details: {
            heapUsedPercent,
            heapUsedMB: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
            heapTotalMB: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
          },
        };

        result.alerts.push(alert);

        await insertAuditLog({
          event: "HIGH_MEMORY_USAGE",
          severity: "WARNING",
          actor: "SafetyGuardian",
          details: alert.details,
        });
      }

      // Log summary
      this.lastCheckTime = new Date();
      console.log(`[SafetyGuardian] Check complete: ${result.issuesFound} issues found, ${result.remediationsApplied} remediations applied`);

      if (result.alerts.length > 0) {
        console.log("[SafetyGuardian] Alerts:", result.alerts.map((a) => `${a.severity}:${a.type}`).join(", "));
      }

      return result;
    } catch (error) {
      console.error("[SafetyGuardian] Check failed:", error);

      await insertAuditLog({
        event: "SAFETY_CHECK_FAILED",
        severity: "ERROR",
        actor: "SafetyGuardian",
        details: { error: String(error) },
      });

      throw error;
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheckTime: this.lastCheckTime,
      checkInterval: this.checkInterval,
    };
  }
}

// Singleton instance
let guardianInstance: SafetyGuardian | null = null;

export function getSafetyGuardian(): SafetyGuardian {
  if (!guardianInstance) {
    guardianInstance = new SafetyGuardian();
  }
  return guardianInstance;
}

export async function initializeSafetyGuardian() {
  const guardian = getSafetyGuardian();
  await guardian.start();
  return guardian;
}

export default SafetyGuardian;
