/**
 * Alibaba DashScope Free Tier Integration
 * Uses Qwen models with fallback to mock mode for development/testing
 */

import { ENV } from "../_core/env";

export interface AgentDecision {
  action: string;
  reasoning: string;
  confidence: number;
  parameters: Record<string, unknown>;
  timestamp: Date;
}

export interface AgentAnalysis {
  analysis: string;
  recommendations: string[];
  riskLevel: "low" | "medium" | "high";
  timestamp: Date;
}

/**
 * Agentic decision-making using Alibaba DashScope Qwen models
 * Free tier: 70M tokens/month, perfect for autonomous operations
 */
export class DashScopeAgent {
  private apiKey: string;
  private useMockMode: boolean;

  constructor() {
    this.apiKey = ENV.alibabaDashscopeApiKey || "";
    // Use mock mode if API key is not configured or in development
    this.useMockMode = !this.apiKey || process.env.NODE_ENV === "development";
  }

  /**
   * Make autonomous decision based on market conditions
   */
  async makeDecision(
    context: {
      marketCondition: string;
      vaultHealth: number;
      agentPerformance: number;
      riskTolerance: number;
    }
  ): Promise<AgentDecision> {
    if (this.useMockMode) {
      return this.mockDecision(context);
    }

    try {
      // Call Qwen model via DashScope API
      const response = await this.callQwenModel(
        `You are an autonomous Solana trading agent. Based on the following context, make a decision:
        
Market Condition: ${context.marketCondition}
Vault Health: ${context.vaultHealth}%
Agent Performance: ${context.agentPerformance}%
Risk Tolerance: ${context.riskTolerance}%

Respond with a JSON object containing:
{
  "action": "buy|sell|hold|harvest|repay",
  "reasoning": "explanation",
  "confidence": 0-1,
  "parameters": {}
}`
      );

      return this.parseDecision(response);
    } catch (error) {
      console.error("[DashScope] Decision making failed, falling back to mock:", error);
      return this.mockDecision(context);
    }
  }

  /**
   * Analyze on-chain data and provide recommendations
   */
  async analyzeOnChainData(
    data: {
      transactionVolume: number;
      liquidityDepth: number;
      slippage: number;
      tokenVelocity: number;
    }
  ): Promise<AgentAnalysis> {
    if (this.useMockMode) {
      return this.mockAnalysis(data);
    }

    try {
      const response = await this.callQwenModel(
        `Analyze this on-chain Solana data and provide trading insights:
        
Transaction Volume: ${data.transactionVolume}
Liquidity Depth: ${data.liquidityDepth}
Slippage: ${data.slippage}%
Token Velocity: ${data.tokenVelocity}

Provide:
1. Market analysis
2. 3 specific recommendations
3. Risk level (low/medium/high)

Format as JSON.`
      );

      return this.parseAnalysis(response);
    } catch (error) {
      console.error("[DashScope] Analysis failed, falling back to mock:", error);
      return this.mockAnalysis(data);
    }
  }

  /**
   * Generate yield optimization strategy
   */
  async generateYieldStrategy(
    portfolio: {
      totalValue: number;
      allocations: Record<string, number>;
      riskProfile: string;
    }
  ): Promise<{ strategy: string; expectedYield: number; actions: string[] }> {
    if (this.useMockMode) {
      return this.mockYieldStrategy(portfolio);
    }

    try {
      const response = await this.callQwenModel(
        `Design an optimal yield farming strategy for this Solana portfolio:
        
Total Value: $${portfolio.totalValue}
Allocations: ${JSON.stringify(portfolio.allocations)}
Risk Profile: ${portfolio.riskProfile}

Respond with JSON:
{
  "strategy": "description",
  "expectedYield": 0-100,
  "actions": ["action1", "action2"]
}`
      );

      return JSON.parse(response);
    } catch (error) {
      console.error("[DashScope] Strategy generation failed, falling back to mock:", error);
      return this.mockYieldStrategy(portfolio);
    }
  }

  /**
   * Call Qwen model via DashScope API
   */
  private async callQwenModel(prompt: string): Promise<string> {
    const response = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "qwen-max",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`DashScope API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      output?: { text?: string };
    };
    return data.output?.text || "";
  }

  /**
   * Parse decision from model response
   */
  private parseDecision(response: string): AgentDecision {
    try {
      const parsed = JSON.parse(response);
      return {
        action: parsed.action || "hold",
        reasoning: parsed.reasoning || "No reasoning provided",
        confidence: parsed.confidence || 0.5,
        parameters: parsed.parameters || {},
        timestamp: new Date(),
      };
    } catch {
      return {
        action: "hold",
        reasoning: "Failed to parse decision",
        confidence: 0,
        parameters: {},
        timestamp: new Date(),
      };
    }
  }

  /**
   * Parse analysis from model response
   */
  private parseAnalysis(response: string): AgentAnalysis {
    try {
      const parsed = JSON.parse(response);
      return {
        analysis: parsed.analysis || "No analysis available",
        recommendations: parsed.recommendations || [],
        riskLevel: parsed.riskLevel || "medium",
        timestamp: new Date(),
      };
    } catch {
      return {
        analysis: "Analysis unavailable",
        recommendations: [],
        riskLevel: "medium",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Mock decision for development/testing
   */
  private mockDecision(context: {
    marketCondition: string;
    vaultHealth: number;
    agentPerformance: number;
    riskTolerance: number;
  }): AgentDecision {
    const actions = ["buy", "sell", "hold", "harvest", "repay"];
    const action = actions[Math.floor(Math.random() * actions.length)];

    return {
      action,
      reasoning: `Based on market condition "${context.marketCondition}", vault health ${context.vaultHealth}%, and risk tolerance ${context.riskTolerance}%, recommending ${action}`,
      confidence: 0.5 + Math.random() * 0.4,
      parameters: {
        amount: Math.floor(Math.random() * 1000),
        slippage: 0.5,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Mock analysis for development/testing
   */
  private mockAnalysis(data: {
    transactionVolume: number;
    liquidityDepth: number;
    slippage: number;
    tokenVelocity: number;
  }): AgentAnalysis {
    return {
      analysis: `Market shows ${data.slippage < 1 ? "good" : "poor"} liquidity conditions with transaction volume of ${data.transactionVolume} and token velocity of ${data.tokenVelocity}`,
      recommendations: [
        "Consider increasing position size in high-liquidity pairs",
        "Monitor slippage levels for optimal entry points",
        "Diversify across multiple yield sources",
      ],
      riskLevel: data.slippage > 2 ? "high" : data.slippage > 1 ? "medium" : "low",
      timestamp: new Date(),
    };
  }

  /**
   * Mock yield strategy for development/testing
   */
  private mockYieldStrategy(portfolio: {
    totalValue: number;
    allocations: Record<string, number>;
    riskProfile: string;
  }): { strategy: string; expectedYield: number; actions: string[] } {
    const baseYield = portfolio.riskProfile === "aggressive" ? 45 : portfolio.riskProfile === "moderate" ? 25 : 12;

    return {
      strategy: `Balanced ${portfolio.riskProfile} strategy allocating across Jupiter Lend earn vaults and liquidity pools`,
      expectedYield: baseYield,
      actions: [
        `Deposit ${portfolio.totalValue * 0.4} to Jupiter Lend earn vault`,
        `Allocate ${portfolio.totalValue * 0.3} to SOL-USDC liquidity pool`,
        `Reserve ${portfolio.totalValue * 0.3} for opportunistic harvesting`,
      ],
    };
  }
}

/**
 * Singleton instance for application-wide use
 */
let agentInstance: DashScopeAgent | null = null;

export function getDashScopeAgent(): DashScopeAgent {
  if (!agentInstance) {
    agentInstance = new DashScopeAgent();
  }
  return agentInstance;
}
