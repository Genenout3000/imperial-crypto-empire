/**
 * Agentic Agent - Autonomous Decision-Making Engine
 * Uses Alibaba DashScope to make intelligent decisions for Paul & Ralph agents
 */

import { getDashScopeClient } from "./dashscope-client";
import { getDb } from "../db";
import { auditLogs } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";

interface AgentDecision {
  timestamp: Date;
  agentName: string;
  decision: string;
  reasoning: string;
  confidence: number;
  actionItems: string[];
}

interface AgentContext {
  agentName: "Paul" | "Ralph";
  currentBalance: number;
  recentPerformance: {
    wins: number;
    losses: number;
    averageGain: number;
  };
  vaultPositions: Array<{
    vault: string;
    collateral: number;
    borrowed: number;
  }>;
  marketConditions: {
    volatility: number;
    trend: "bullish" | "bearish" | "neutral";
    volume: number;
  };
}

class AgenticAgent {
  private dashScope = getDashScopeClient();
  private decisionHistory: AgentDecision[] = [];
  private lastDecisionTime: Map<string, Date> = new Map();
  private decisionCooldown = 5 * 60 * 1000; // 5 minutes

  /**
   * Make an autonomous decision for an agent
   */
  async makeDecision(context: AgentContext): Promise<AgentDecision> {
    try {
      // Check cooldown
      const lastDecision = this.lastDecisionTime.get(context.agentName);
      if (lastDecision && Date.now() - lastDecision.getTime() < this.decisionCooldown) {
        console.log(`[AgenticAgent] ${context.agentName} in cooldown period`);
        return this.getLastDecision(context.agentName) || this.createDefaultDecision(context);
      }

      console.log(`[AgenticAgent] Making decision for ${context.agentName}`);

      // Build context for AI
      const contextString = this.buildContextString(context);

      // Get AI recommendation
      const recommendation = await this.dashScope.generateAgentInstructions({
        agentName: context.agentName,
        currentStrategy: this.getStrategyDescription(context.agentName),
        recentPerformance: this.formatPerformance(context.recentPerformance),
        marketConditions: this.formatMarketConditions(context.marketConditions),
      });

      // Parse recommendation into actionable items
      const decision = this.parseRecommendation(recommendation, context);

      // Store decision
      this.decisionHistory.push(decision);
      this.lastDecisionTime.set(context.agentName, new Date());

      // Log to database
      await this.logDecision(decision);

      // Notify on significant decisions
      if (decision.confidence > 0.8) {
        await notifyOwner({
          title: `🤖 ${context.agentName} Agent Decision`,
          content: `Decision: ${decision.decision}\nConfidence: ${(decision.confidence * 100).toFixed(0)}%\nActions: ${decision.actionItems.join(", ")}`,
        });
      }

      return decision;
    } catch (error) {
      console.error(`[AgenticAgent] Error making decision for ${context.agentName}:`, error);

      // Return safe default decision
      return this.createDefaultDecision(context);
    }
  }

  /**
   * Analyze vault risk and recommend actions
   */
  async analyzeVaultRisk(vaultData: {
    agentName: string;
    collateral: number;
    borrowed: number;
    currentPrice: number;
    liquidationPrice: number;
  }): Promise<{
    riskLevel: "low" | "medium" | "high" | "critical";
    recommendation: string;
    suggestedAction: string;
  }> {
    try {
      const riskAssessment = await this.dashScope.assessRisk({
        collateral: vaultData.collateral,
        borrowed: vaultData.borrowed,
        currentPrice: vaultData.currentPrice,
        liquidationPrice: vaultData.liquidationPrice,
      });

      let suggestedAction = "HOLD";
      if (riskAssessment.riskLevel === "critical") {
        suggestedAction = "EMERGENCY_REPAY";
      } else if (riskAssessment.riskLevel === "high") {
        suggestedAction = "REDUCE_POSITION";
      } else if (riskAssessment.riskLevel === "low") {
        suggestedAction = "INCREASE_POSITION";
      }

      // Log risk assessment
      await this.logRiskAssessment(vaultData.agentName, riskAssessment);

      return {
        riskLevel: riskAssessment.riskLevel,
        recommendation: riskAssessment.recommendation,
        suggestedAction,
      };
    } catch (error) {
      console.error("[AgenticAgent] Error analyzing vault risk:", error);
      return {
        riskLevel: "medium",
        recommendation: "Unable to analyze risk at this time",
        suggestedAction: "HOLD",
      };
    }
  }

  /**
   * Get market sentiment for liquidity decisions
   */
  async getMarketSentiment(marketData: {
    recentTransactions: string;
    volumeTrend: string;
    priceAction: string;
  }): Promise<{
    sentiment: "bullish" | "bearish" | "neutral";
    confidence: number;
    opportunities: string[];
  }> {
    try {
      const analysis = await this.dashScope.analyzeMarketSentiment(marketData);

      // Parse sentiment from analysis
      const sentiment = this.parseSentiment(analysis);
      const confidence = this.calculateConfidence(analysis);
      const opportunities = this.extractOpportunities(analysis);

      return {
        sentiment,
        confidence,
        opportunities,
      };
    } catch (error) {
      console.error("[AgenticAgent] Error analyzing market sentiment:", error);
      return {
        sentiment: "neutral",
        confidence: 0.5,
        opportunities: [],
      };
    }
  }

  /**
   * Build context string for AI analysis
   */
  private buildContextString(context: AgentContext): string {
    return `
Agent: ${context.agentName}
Balance: $${context.currentBalance.toFixed(2)}
Win Rate: ${((context.recentPerformance.wins / (context.recentPerformance.wins + context.recentPerformance.losses)) * 100).toFixed(1)}%
Average Gain: ${context.recentPerformance.averageGain.toFixed(2)}%
Volatility: ${context.marketConditions.volatility.toFixed(2)}
Trend: ${context.marketConditions.trend}
Volume: ${context.marketConditions.volume.toFixed(0)}
    `;
  }

  /**
   * Get strategy description
   */
  private getStrategyDescription(agentName: "Paul" | "Ralph"): string {
    if (agentName === "Paul") {
      return "Yield harvesting: Deposit to Jupiter Lend earn vaults, monitor APY, rebalance positions for optimal returns";
    } else {
      return "Liquidity sniping: Monitor new liquidity pools, identify arbitrage opportunities, execute quick trades";
    }
  }

  /**
   * Format performance data
   */
  private formatPerformance(performance: {
    wins: number;
    losses: number;
    averageGain: number;
  }): string {
    const total = performance.wins + performance.losses;
    const winRate = total > 0 ? ((performance.wins / total) * 100).toFixed(1) : "0";
    return `Wins: ${performance.wins}, Losses: ${performance.losses}, Win Rate: ${winRate}%, Avg Gain: ${performance.averageGain.toFixed(2)}%`;
  }

  /**
   * Format market conditions
   */
  private formatMarketConditions(conditions: {
    volatility: number;
    trend: string;
    volume: number;
  }): string {
    return `Volatility: ${conditions.volatility.toFixed(2)}, Trend: ${conditions.trend}, Volume: ${conditions.volume.toFixed(0)}`;
  }

  /**
   * Parse AI recommendation into decision
   */
  private parseRecommendation(recommendation: string, context: AgentContext): AgentDecision {
    const lines = recommendation.split("\n");
    const actionItems = lines.filter((line) => line.match(/^\d+\./)).map((line) => line.replace(/^\d+\.\s*/, ""));

    return {
      timestamp: new Date(),
      agentName: context.agentName,
      decision: actionItems[0] || "HOLD",
      reasoning: recommendation,
      confidence: Math.random() * 0.5 + 0.5, // 0.5-1.0
      actionItems: actionItems.slice(0, 3),
    };
  }

  /**
   * Parse sentiment from analysis
   */
  private parseSentiment(analysis: string): "bullish" | "bearish" | "neutral" {
    const lower = analysis.toLowerCase();
    if (lower.includes("bullish")) return "bullish";
    if (lower.includes("bearish")) return "bearish";
    return "neutral";
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(analysis: string): number {
    // Simple heuristic: longer analysis = more confidence
    return Math.min(0.95, 0.5 + analysis.length / 1000);
  }

  /**
   * Extract opportunities from analysis
   */
  private extractOpportunities(analysis: string): string[] {
    const opportunities: string[] = [];
    const lines = analysis.split("\n");

    lines.forEach((line) => {
      if (line.includes("opportunity") || line.includes("potential")) {
        opportunities.push(line.trim());
      }
    });

    return opportunities.slice(0, 3);
  }

  /**
   * Create default safe decision
   */
  private createDefaultDecision(context: AgentContext): AgentDecision {
    return {
      timestamp: new Date(),
      agentName: context.agentName,
      decision: "HOLD",
      reasoning: "Unable to make decision at this time. Maintaining current position.",
      confidence: 0.3,
      actionItems: ["Monitor market conditions", "Await next decision cycle"],
    };
  }

  /**
   * Get last decision for agent
   */
  private getLastDecision(agentName: string): AgentDecision | undefined {
    return this.decisionHistory.find((d) => d.agentName === agentName);
  }

  /**
   * Log decision to database
   */
  private async logDecision(decision: AgentDecision): Promise<void> {
    const db = await getDb();
    if (!db) return;

    try {
      await db.insert(auditLogs).values({
        event: "agent_decision",
        severity: decision.confidence > 0.8 ? "INFO" : "INFO",
        actor: `agentic_${decision.agentName}`,
        details: decision as any,
      });
    } catch (error) {
      console.error("[AgenticAgent] Error logging decision:", error);
    }
  }

  /**
   * Log risk assessment
   */
  private async logRiskAssessment(agentName: string, assessment: any): Promise<void> {
    const db = await getDb();
    if (!db) return;

    try {
      await db.insert(auditLogs).values({
        event: "vault_risk_assessment",
        severity: assessment.riskLevel === "critical" ? "CRITICAL" : "INFO",
        actor: `risk_${agentName}`,
        details: assessment,
      });
    } catch (error) {
      console.error("[AgenticAgent] Error logging risk assessment:", error);
    }
  }

  /**
   * Get decision history
   */
  getDecisionHistory(agentName?: string): AgentDecision[] {
    if (agentName) {
      return this.decisionHistory.filter((d) => d.agentName === agentName);
    }
    return this.decisionHistory;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.dashScope.healthCheck();
    } catch (error) {
      console.error("[AgenticAgent] Health check failed:", error);
      return false;
    }
  }
}

let agenticAgent: AgenticAgent | null = null;

export function getAgenticAgent(): AgenticAgent {
  if (!agenticAgent) {
    agenticAgent = new AgenticAgent();
  }
  return agenticAgent;
}

export { AgenticAgent, AgentDecision, AgentContext };
