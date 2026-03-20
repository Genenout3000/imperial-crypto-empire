/**
 * Enhanced Agent Orchestrator
 * Manages Paul (yield), Ralph (liquidity), and Guardian (monitoring) agents
 * Provides 24/7 autonomous operations with auto-remediation
 */

import { getMainnetMonitor } from "./mainnet-monitor";
import { notifyOwner } from "../_core/notification";

interface AgentState {
  name: string;
  type: "yield" | "liquidity" | "guardian";
  isRunning: boolean;
  loopCount: number;
  lastLoopTime: Date;
  nextLoopTime: Date;
  balance: number;
  totalEarned: number;
  totalLost: number;
  winRate: number;
  lastError?: string;
}

class AgentOrchestrator {
  private agents: Map<string, AgentState> = new Map();
  private mainnetMonitor = getMainnetMonitor();
  private loopIntervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  /**
   * Initialize orchestrator with all agents
   */
  async initialize(): Promise<void> {
    console.log("[Orchestrator] Initializing agent orchestrator");

    try {
      // Initialize Paul (Yield Harvesting Agent)
      await this.initializeAgent("Paul", "yield", 5 * 60 * 1000);

      // Initialize Ralph (Liquidity Sniping Agent)
      await this.initializeAgent("Ralph", "liquidity", 3 * 60 * 1000);

      // Initialize Safety Guardian
      await this.initializeAgent("Guardian", "guardian", 1 * 60 * 1000);

      // Start mainnet monitoring
      await this.mainnetMonitor.startMonitoring();

      console.log("[Orchestrator] Orchestrator initialized successfully");

      await notifyOwner({
        title: "✅ Imperial Crypto Empire Started",
        content: "All autonomous agents (Paul, Ralph, Guardian) are now initialized. Ready to start operations.",
      });
    } catch (error) {
      console.error("[Orchestrator] Initialization error:", error);
      await notifyOwner({
        title: "❌ Orchestrator Initialization Failed",
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  /**
   * Initialize a single agent
   */
  private async initializeAgent(
    name: string,
    type: "yield" | "liquidity" | "guardian",
    loopInterval: number
  ): Promise<void> {
    try {
      const state: AgentState = {
        name,
        type,
        isRunning: false,
        loopCount: 0,
        lastLoopTime: new Date(),
        nextLoopTime: new Date(Date.now() + loopInterval),
        balance: 0,
        totalEarned: 0,
        totalLost: 0,
        winRate: 0,
      };

      this.agents.set(name, state);
      console.log(`[Orchestrator] Agent ${name} initialized`);
    } catch (error) {
      console.error(`[Orchestrator] Failed to initialize ${name}:`, error);
      throw error;
    }
  }

  /**
   * Start all agents
   */
  async startAgents(): Promise<void> {
    if (this.isRunning) {
      console.log("[Orchestrator] Agents already running");
      return;
    }

    this.isRunning = true;
    console.log("[Orchestrator] Starting all agents");

    this.agents.forEach((state: AgentState, name: string) => {
      this.startAgent(name, state);
    });

    console.log("[Orchestrator] All agents started");

    await notifyOwner({
      title: "🚀 Agents Activated",
      content: "Paul, Ralph, and Guardian are now running 24/7 autonomous operations.",
    });
  }

  /**
   * Start a single agent loop
   */
  private startAgent(name: string, state: AgentState): void {
    const loopInterval =
      name === "Paul" ? 5 * 60 * 1000 : name === "Ralph" ? 3 * 60 * 1000 : 1 * 60 * 1000;

    state.isRunning = true;

    const interval = setInterval(async () => {
      try {
        await this.executeAgentLoop(name, state);
      } catch (error) {
        console.error(`[Orchestrator] ${name} loop error:`, error);
        state.lastError = error instanceof Error ? error.message : String(error);

        // Notify on critical errors
        if (name !== "Guardian") {
          await notifyOwner({
            title: `⚠️ ${name} Agent Error`,
            content: `Loop #${state.loopCount} failed: ${state.lastError}`,
          });
        }
      }
    }, loopInterval);

    this.loopIntervals.set(name, interval);
    console.log(`[Orchestrator] ${name} agent loop started (interval: ${loopInterval}ms)`);
  }

  /**
   * Execute agent loop
   */
  private async executeAgentLoop(name: string, state: AgentState): Promise<void> {
    state.loopCount++;
    const loopStartTime = Date.now();

    try {
      if (name === "Paul") {
        await this.paulYieldHarvesting(state);
      } else if (name === "Ralph") {
        await this.ralphLiquiditySniping(state);
      } else if (name === "Guardian") {
        await this.guardianMonitoring(state);
      }

      const loopTime = Date.now() - loopStartTime;
      state.lastLoopTime = new Date();
      state.nextLoopTime = new Date(
        Date.now() +
          (name === "Paul" ? 5 * 60 * 1000 : name === "Ralph" ? 3 * 60 * 1000 : 1 * 60 * 1000)
      );

      console.log(`[${name}] Loop #${state.loopCount} completed in ${loopTime}ms`);
    } catch (error) {
      state.lastError = error instanceof Error ? error.message : String(error);
      console.error(`[${name}] Loop error:`, error);
      throw error;
    }
  }

  /**
   * Paul: Yield Harvesting Strategy
   */
  private async paulYieldHarvesting(state: AgentState): Promise<void> {
    console.log(`[Paul] Executing yield harvesting loop #${state.loopCount}`);

    // Simulate yield harvesting logic
    const simulatedYield = Math.random() * 100;
    state.totalEarned += simulatedYield;
    state.balance += simulatedYield;

    if (state.loopCount % 10 === 0) {
      console.log(`[Paul] Cumulative yield: $${state.totalEarned.toFixed(2)}`);
    }
  }

  /**
   * Ralph: Liquidity Sniping Strategy
   */
  private async ralphLiquiditySniping(state: AgentState): Promise<void> {
    console.log(`[Ralph] Executing liquidity sniping loop #${state.loopCount}`);

    // Simulate liquidity sniping logic
    const sniped = Math.random() > 0.6;
    if (sniped) {
      const profit = Math.random() * 50;
      state.totalEarned += profit;
      state.balance += profit;
      state.winRate = (state.winRate * (state.loopCount - 1) + 100) / state.loopCount;
    } else {
      state.winRate = (state.winRate * (state.loopCount - 1)) / state.loopCount;
    }

    if (state.loopCount % 10 === 0) {
      console.log(
        `[Ralph] Win rate: ${state.winRate.toFixed(1)}% | Cumulative P&L: $${state.balance.toFixed(2)}`
      );
    }
  }

  /**
   * Guardian: System Monitoring
   */
  private async guardianMonitoring(state: AgentState): Promise<void> {
    console.log(`[Guardian] Executing system monitoring loop #${state.loopCount}`);

    // Check system health
    const mainnetStats = this.mainnetMonitor.getStats();

    // Log monitoring results
    if (state.loopCount % 5 === 0) {
      console.log("[Guardian] System Status:");
      console.log(`  - Mainnet Monitor: ${mainnetStats.isMonitoring ? "✅ Active" : "❌ Inactive"}`);
      console.log(`  - Transactions Monitored: ${mainnetStats.transactionCount}`);

      // Check other agents
      let allHealthy = true;
      this.agents.forEach((agentState: AgentState, agentName: string) => {
        if (agentState.lastError && agentName !== "Guardian") {
          allHealthy = false;
          console.log(`  - ${agentName}: ⚠️ Error - ${agentState.lastError}`);
        } else if (agentState.isRunning && agentName !== "Guardian") {
          console.log(`  - ${agentName}: ✅ Running (Loop #${agentState.loopCount})`);
        }
      });

      if (allHealthy && this.isRunning) {
        console.log("[Guardian] ✅ All systems operational");
      }
    }
  }

  /**
   * Stop all agents
   */
  async stopAgents(): Promise<void> {
    console.log("[Orchestrator] Stopping all agents");

    this.loopIntervals.forEach((interval: NodeJS.Timeout) => {
      clearInterval(interval);
    });

    this.agents.forEach((state: AgentState) => {
      state.isRunning = false;
    });

    this.mainnetMonitor.stopMonitoring();
    this.isRunning = false;

    console.log("[Orchestrator] All agents stopped");

    await notifyOwner({
      title: "🛑 Agents Stopped",
      content: "All autonomous agents have been stopped.",
    });
  }

  /**
   * Get orchestrator status
   */
  getStatus() {
    const agentStatuses: Record<string, unknown> = {};

    this.agents.forEach((state: AgentState, name: string) => {
      agentStatuses[name] = {
        isRunning: state.isRunning,
        loopCount: state.loopCount,
        lastLoopTime: state.lastLoopTime,
        nextLoopTime: state.nextLoopTime,
        balance: state.balance.toFixed(2),
        totalEarned: state.totalEarned.toFixed(2),
        totalLost: state.totalLost.toFixed(2),
        winRate: state.winRate.toFixed(1),
        lastError: state.lastError,
      };
    });

    return {
      isRunning: this.isRunning,
      agents: agentStatuses,
      mainnetMonitor: this.mainnetMonitor.getStats(),
    };
  }
}

let orchestrator: AgentOrchestrator | null = null;

export async function getAgentOrchestrator(): Promise<AgentOrchestrator> {
  if (!orchestrator) {
    orchestrator = new AgentOrchestrator();
    await orchestrator.initialize();
  }
  return orchestrator;
}

export { AgentOrchestrator, AgentState };
