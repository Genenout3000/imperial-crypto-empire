/**
 * AGENT ORCHESTRATOR
 * 
 * Manages the lifecycle of all autonomous agents:
 * - Paul (Yield Harvesting)
 * - Ralph (Liquidity Sniping)
 * - Safety Guardian (System Monitoring)
 * 
 * Provides:
 * - Centralized startup/shutdown
 * - Health monitoring
 * - Performance aggregation
 * - Conflict resolution
 */

import { initializePaulAgent, getPaulAgent } from "./paul-agent";
import { initializeRalphAgent, getRalphAgent } from "./ralph-agent";
import { initializeSafetyGuardian, getSafetyGuardian } from "./safety-guardian";
import { insertAuditLog, insertNotification } from "../db";
import { notifyOwner } from "../_core/notification";

interface AgentOrchestratorStatus {
  isRunning: boolean;
  startedAt: Date | null;
  agents: {
    paul: { isRunning: boolean; loopNumber: number };
    ralph: { isRunning: boolean; loopNumber: number };
    guardian: { isRunning: boolean; lastCheckTime: Date | null };
  };
}

class AgentOrchestrator {
  private isRunning = false;
  private startedAt: Date | null = null;
  private healthCheckInterval = 120000; // 2 minutes

  /**
   * Initialize and start all agents
   */
  async start() {
    if (this.isRunning) {
      console.log("[Orchestrator] Already running");
      return;
    }

    try {
      console.log("[Orchestrator] Starting all autonomous agents...");
      this.startedAt = new Date();

      // Start Safety Guardian first (highest priority)
      console.log("[Orchestrator] Initializing Safety Guardian...");
      await initializeSafetyGuardian();
      console.log("[Orchestrator] ✓ Safety Guardian started");

      // Start Paul (Yield Harvesting)
      console.log("[Orchestrator] Initializing Paul (Yield Harvesting)...");
      await initializePaulAgent();
      console.log("[Orchestrator] ✓ Paul agent started");

      // Start Ralph (Liquidity Sniping)
      console.log("[Orchestrator] Initializing Ralph (Liquidity Sniping)...");
      await initializeRalphAgent();
      console.log("[Orchestrator] ✓ Ralph agent started");

      this.isRunning = true;

      // Log startup
      await insertAuditLog({
        event: "AGENTS_STARTED",
        severity: "INFO",
        actor: "AgentOrchestrator",
        details: {
          timestamp: this.startedAt.toISOString(),
          agents: ["Paul", "Ralph", "SafetyGuardian"],
        },
      });

      // Notify owner
      await notifyOwner({
        title: "🚀 Autonomous Agents Started",
        content: "Paul (Yield Harvesting), Ralph (Liquidity Sniping), and Safety Guardian are now running.",
      });

      await insertNotification({
        title: "Autonomous Agents Started",
        content: "All agents initialized and running",
        type: "success",
      });

      // Start health monitoring
      this.startHealthMonitoring();

      console.log("[Orchestrator] All agents started successfully");
    } catch (error) {
      console.error("[Orchestrator] Failed to start agents:", error);

      await insertAuditLog({
        event: "AGENTS_START_FAILED",
        severity: "CRITICAL",
        actor: "AgentOrchestrator",
        details: { error: String(error) },
      });

      await notifyOwner({
        title: "🚨 Agent Startup Failed",
        content: `Failed to start autonomous agents: ${String(error).substring(0, 100)}`,
      });

      throw error;
    }
  }

  /**
   * Stop all agents gracefully
   */
  async stop() {
    if (!this.isRunning) {
      console.log("[Orchestrator] Not running");
      return;
    }

    try {
      console.log("[Orchestrator] Stopping all autonomous agents...");

      const paul = getPaulAgent();
      const ralph = getRalphAgent();
      const guardian = getSafetyGuardian();

      paul.stop();
      ralph.stop();
      guardian.stop();

      this.isRunning = false;

      await insertAuditLog({
        event: "AGENTS_STOPPED",
        severity: "INFO",
        actor: "AgentOrchestrator",
        details: {
          stoppedAt: new Date().toISOString(),
          uptime: this.startedAt ? Date.now() - this.startedAt.getTime() : 0,
        },
      });

      console.log("[Orchestrator] All agents stopped");
    } catch (error) {
      console.error("[Orchestrator] Error stopping agents:", error);
      throw error;
    }
  }

  /**
   * Start health monitoring loop
   */
  private startHealthMonitoring() {
    setInterval(() => this.checkAgentHealth(), this.healthCheckInterval);
  }

  /**
   * Check health of all agents
   */
  private async checkAgentHealth() {
    try {
      const paul = getPaulAgent();
      const ralph = getRalphAgent();
      const guardian = getSafetyGuardian();

      const paulStatus = paul.getStatus();
      const ralphStatus = ralph.getStatus();
      const guardianStatus = guardian.getStatus();

      console.log("[Orchestrator] Health check:");
      console.log(`  Paul: ${paulStatus.isRunning ? "✓" : "✗"} (Loop #${paulStatus.loopNumber})`);
      console.log(`  Ralph: ${ralphStatus.isRunning ? "✓" : "✗"} (Loop #${ralphStatus.loopNumber})`);
      console.log(`  Guardian: ${guardianStatus.isRunning ? "✓" : "✗"}`);

      // Check for issues
      const issues: string[] = [];

      if (!paulStatus.isRunning) issues.push("Paul agent not running");
      if (!ralphStatus.isRunning) issues.push("Ralph agent not running");
      if (!guardianStatus.isRunning) issues.push("Safety Guardian not running");

      if (issues.length > 0) {
        console.warn("[Orchestrator] Health issues detected:", issues);

        await insertAuditLog({
          event: "AGENT_HEALTH_WARNING",
          severity: "WARNING",
          actor: "AgentOrchestrator",
          details: { issues },
        });

        await notifyOwner({
          title: "⚠️ Agent Health Warning",
          content: `Issues detected: ${issues.join(", ")}`,
        });
      }
    } catch (error) {
      console.error("[Orchestrator] Health check failed:", error);
    }
  }

  /**
   * Get orchestrator status
   */
  getStatus(): AgentOrchestratorStatus {
    const paul = getPaulAgent();
    const ralph = getRalphAgent();
    const guardian = getSafetyGuardian();

    return {
      isRunning: this.isRunning,
      startedAt: this.startedAt,
      agents: {
        paul: paul.getStatus(),
        ralph: ralph.getStatus(),
        guardian: guardian.getStatus(),
      },
    };
  }

  /**
   * Get aggregated agent performance
   */
  async getAggregatedMetrics() {
    return {
      orchestratorRunning: this.isRunning,
      uptime: this.startedAt ? Date.now() - this.startedAt.getTime() : 0,
      agents: {
        paul: getPaulAgent().getStatus(),
        ralph: getRalphAgent().getStatus(),
        guardian: getSafetyGuardian().getStatus(),
      },
      timestamp: new Date(),
    };
  }
}

// Singleton instance
let orchestratorInstance: AgentOrchestrator | null = null;

export function getAgentOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator();
  }
  return orchestratorInstance;
}

export async function initializeAgentOrchestrator() {
  const orchestrator = getAgentOrchestrator();
  await orchestrator.start();
  return orchestrator;
}

export default AgentOrchestrator;
