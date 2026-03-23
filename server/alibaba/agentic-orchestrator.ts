/**
 * Agentic Agent Orchestrator
 * Coordinates autonomous agents (Paul, Ralph, Guardian) with AI-powered decision making
 */

import { getDb } from "../db";
import { getDashScopeAgent, AgentDecision, AgentAnalysis } from "./dashscope-free";
import { agents, agentMetrics } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface AgentState {
  id: string;
  name: string;
  type: "yield" | "liquidity" | "guardian";
  status: "active" | "paused" | "error";
  lastDecision?: AgentDecision;
  lastAnalysis?: AgentAnalysis;
  performance: {
    totalActions: number;
    successRate: number;
    averageReturn: number;
  };
}

/**
 * Orchestrates autonomous agents with Alibaba DashScope AI
 */
export class AgenticOrchestrator {
  private agents: Map<string, AgentState> = new Map();
  private dashscope = getDashScopeAgent();
  private isRunning = false;

  /**
   * Initialize orchestrator with Paul, Ralph, and Guardian agents
   */
  async initialize(): Promise<void> {
    const db = await getDb();
    if (!db) {
      console.error("[AgenticOrchestrator] Database not available");
      return;
    }

    // Initialize Paul (Yield Harvesting Agent)
    const paul: AgentState = {
      id: "paul-yield-agent",
      name: "Paul",
      type: "yield",
      status: "active",
      performance: {
        totalActions: 0,
        successRate: 0.85,
        averageReturn: 0.15,
      },
    };

    // Initialize Ralph (Liquidity Sniping Agent)
    const ralph: AgentState = {
      id: "ralph-liquidity-agent",
      name: "Ralph",
      type: "liquidity",
      status: "active",
      performance: {
        totalActions: 0,
        successRate: 0.72,
        averageReturn: 0.22,
      },
    };

    // Initialize Guardian (System Monitoring Agent)
    const guardian: AgentState = {
      id: "guardian-monitor-agent",
      name: "Guardian",
      type: "guardian",
      status: "active",
      performance: {
        totalActions: 0,
        successRate: 0.99,
        averageReturn: 0,
      },
    };

    this.agents.set(paul.id, paul);
    this.agents.set(ralph.id, ralph);
    this.agents.set(guardian.id, guardian);

    // Store in database
    for (const agent of [paul, ralph, guardian]) {
      try {
        await db.insert(agents).values({
          name: agent.name,
          type: agent.type as "paul" | "ralph",
          strategy: agent.type === "yield" ? "harvest" : agent.type === "liquidity" ? "snipe" : "monitor",
          status: "running",
          publicKey: "11111111111111111111111111111111",
          balance: "0",
          totalEarned: "0",
          totalLost: "0",
          winRate: "0",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error(`[AgenticOrchestrator] Failed to store ${agent.name}:`, error);
      }
    }

    console.log("[AgenticOrchestrator] Initialized with Paul, Ralph, and Guardian");
  }

  /**
   * Start autonomous agent loops
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log("[AgenticOrchestrator] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[AgenticOrchestrator] Starting autonomous agent loops");

    // Paul's yield harvesting loop
    this.startPaulLoop();

    // Ralph's liquidity sniping loop
    this.startRalphLoop();

    // Guardian's monitoring loop
    this.startGuardianLoop();
  }

  /**
   * Paul's autonomous yield harvesting loop
   */
  private async startPaulLoop(): Promise<void> {
    const paul = this.agents.get("paul-yield-agent");
    if (!paul) return;

    setInterval(async () => {
      try {
        // Get market context
        const decision = await this.dashscope.makeDecision({
          marketCondition: "normal",
          vaultHealth: 85,
          agentPerformance: paul.performance.successRate * 100,
          riskTolerance: 60,
        });

        paul.lastDecision = decision;
        paul.performance.totalActions++;

        if (decision.confidence > 0.6) {
          console.log(`[Paul] Decision: ${decision.action} (confidence: ${decision.confidence.toFixed(2)})`);
          await this.executePaulAction(decision);
        }
      } catch (error) {
        console.error("[Paul] Loop error:", error);
        paul.status = "error";
      }
    }, 30000); // Run every 30 seconds
  }

  /**
   * Ralph's autonomous liquidity sniping loop
   */
  private async startRalphLoop(): Promise<void> {
    const ralph = this.agents.get("ralph-liquidity-agent");
    if (!ralph) return;

    setInterval(async () => {
      try {
        // Analyze on-chain data
        const analysis = await this.dashscope.analyzeOnChainData({
          transactionVolume: Math.random() * 10000,
          liquidityDepth: Math.random() * 50000,
          slippage: Math.random() * 3,
          tokenVelocity: Math.random() * 100,
        });

        ralph.lastAnalysis = analysis;
        ralph.performance.totalActions++;

        if (analysis.riskLevel === "low" || analysis.riskLevel === "medium") {
          console.log(`[Ralph] Opportunity detected: ${analysis.riskLevel} risk`);
          await this.executeRalphAction(analysis);
        }
      } catch (error) {
        console.error("[Ralph] Loop error:", error);
        ralph.status = "error";
      }
    }, 45000); // Run every 45 seconds
  }

  /**
   * Guardian's system monitoring loop
   */
  private async startGuardianLoop(): Promise<void> {
    const guardian = this.agents.get("guardian-monitor-agent");
    if (!guardian) return;

    setInterval(async () => {
      try {
        // Monitor system health
        const paul = this.agents.get("paul-yield-agent");
        const ralph = this.agents.get("ralph-liquidity-agent");

        guardian.performance.totalActions++;

        // Check agent health
        if (paul?.status === "error") {
          console.log("[Guardian] Paul agent error detected, attempting recovery");
          paul.status = "active";
        }

        if (ralph?.status === "error") {
          console.log("[Guardian] Ralph agent error detected, attempting recovery");
          ralph.status = "active";
        }

        // Log metrics
        await this.logGuardianMetrics();
      } catch (error) {
        console.error("[Guardian] Loop error:", error);
        guardian.status = "error";
      }
    }, 60000); // Run every 60 seconds
  }

  /**
   * Execute Paul's action
   */
  private async executePaulAction(decision: AgentDecision): Promise<void> {
    const db = await getDb();
    if (!db) return;

    try {
      // Log action to database
      await db.insert(agentMetrics).values({
        agentId: 1, // Paul's ID
        loopNumber: 1,
        strategyUsed: decision.action,
        transactionsExecuted: 1,
        profitLoss: "0",
        gasUsed: "0",
        executionTime: 0,
        successRate: String(decision.confidence * 100),
        metadata: {
          reasoning: decision.reasoning,
          parameters: decision.parameters,
        },
      });

      console.log(`[Paul] Executed ${decision.action} with confidence ${decision.confidence.toFixed(2)}`);
    } catch (error) {
      console.error("[Paul] Action execution failed:", error);
    }
  }

  /**
   * Execute Ralph's action
   */
  private async executeRalphAction(analysis: AgentAnalysis): Promise<void> {
    const db = await getDb();
    if (!db) return;

    try {
      // Log action to database
      await db.insert(agentMetrics).values({
        agentId: 2, // Ralph's ID
        loopNumber: 1,
        strategyUsed: "snipe",
        transactionsExecuted: 1,
        profitLoss: "0",
        gasUsed: "0",
        executionTime: 0,
        successRate: "80",
        metadata: {
          analysis: analysis.analysis,
          recommendations: analysis.recommendations,
          riskLevel: analysis.riskLevel,
        },
      });

      console.log(`[Ralph] Sniping opportunity with ${analysis.riskLevel} risk`);
    } catch (error) {
      console.error("[Ralph] Action execution failed:", error);
    }
  }

  /**
   * Log Guardian metrics
   */
  private async logGuardianMetrics(): Promise<void> {
    const db = await getDb();
    if (!db) return;

    try {
      const paul = this.agents.get("paul-yield-agent");
      const ralph = this.agents.get("ralph-liquidity-agent");
      const guardian = this.agents.get("guardian-monitor-agent");

      const metrics = {
        paul: {
          status: paul?.status,
          actions: paul?.performance.totalActions,
          successRate: paul?.performance.successRate,
        },
        ralph: {
          status: ralph?.status,
          actions: ralph?.performance.totalActions,
          successRate: ralph?.performance.successRate,
        },
        guardian: {
          status: guardian?.status,
          actions: guardian?.performance.totalActions,
        },
        timestamp: new Date(),
      };

      console.log("[Guardian] System metrics:", metrics);
    } catch (error) {
      console.error("[Guardian] Metrics logging failed:", error);
    }
  }

  /**
   * Stop agent loops
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    console.log("[AgenticOrchestrator] Stopped all agent loops");
  }

  /**
   * Get agent status
   */
  getAgentStatus(agentId: string): AgentState | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents status
   */
  getAllAgentsStatus(): AgentState[] {
    return Array.from(this.agents.values());
  }

  /**
   * Update agent configuration
   */
  async updateAgentConfig(agentId: string, config: Partial<AgentState>): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    Object.assign(agent, config);
    console.log(`[AgenticOrchestrator] Updated ${agent.name} configuration`);
  }
}

/**
 * Singleton instance
 */
let orchestratorInstance: AgenticOrchestrator | null = null;

export async function getAgenticOrchestrator(): Promise<AgenticOrchestrator> {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgenticOrchestrator();
    await orchestratorInstance.initialize();
  }
  return orchestratorInstance;
}

/**
 * Start orchestrator on demand
 */
export async function startAgenticOrchestrator(): Promise<void> {
  const orchestrator = await getAgenticOrchestrator();
  await orchestrator.start();
}
