/**
 * Alibaba DashScope API Client
 * Integrates with Alibaba Cloud's AI models for agentic operations
 */

import { ENV } from "../_core/env";

interface DashScopeMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface DashScopeRequest {
  model: string;
  messages: DashScopeMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

interface DashScopeResponse {
  output: {
    choices: Array<{
      message: {
        role: string;
        content: string;
      };
      finish_reason: string;
    }>;
  };
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  request_id: string;
}

class DashScopeClient {
  private apiKey: string;
  private baseUrl = "https://dashscope.aliyuncs.com/api/v1";
  private model = "qwen-turbo"; // Default model

  constructor() {
    this.apiKey = ENV.alibabaDashscopeApiKey;
    if (!this.apiKey) {
      throw new Error("ALIBABA_DASHSCOPE_API_KEY is not configured");
    }
  }

  /**
   * Send a message to DashScope and get a response
   */
  async sendMessage(
    messages: DashScopeMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    try {
      const request: DashScopeRequest = {
        model: options?.model || this.model,
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2048,
      };

      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`DashScope API error: ${response.status} - ${error}`);
      }

      const data = (await response.json()) as DashScopeResponse;

      if (data.output?.choices?.[0]?.message?.content) {
        return data.output.choices[0].message.content;
      }

      throw new Error("No response content from DashScope");
    } catch (error) {
      console.error("[DashScope] Error:", error);
      throw error;
    }
  }

  /**
   * Analyze on-chain data and suggest strategies
   */
  async analyzeStrategy(
    context: {
      vaultPositions: string;
      marketConditions: string;
      agentPerformance: string;
    }
  ): Promise<string> {
    const systemPrompt = `You are an expert DeFi strategist analyzing Solana blockchain data. 
Provide actionable insights for yield farming and liquidity strategies based on current market conditions.
Focus on risk-adjusted returns and liquidation prevention.`;

    const userPrompt = `Analyze the following DeFi environment and suggest optimal strategies:

Vault Positions:
${context.vaultPositions}

Market Conditions:
${context.marketConditions}

Agent Performance:
${context.agentPerformance}

Provide specific, actionable recommendations for Paul (yield harvesting) and Ralph (liquidity sniping) agents.`;

    return this.sendMessage(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      { temperature: 0.5, maxTokens: 1024 }
    );
  }

  /**
   * Assess risk for vault positions
   */
  async assessRisk(vaultData: {
    collateral: number;
    borrowed: number;
    currentPrice: number;
    liquidationPrice: number;
  }): Promise<{
    riskLevel: "low" | "medium" | "high" | "critical";
    recommendation: string;
    healthRatio: number;
  }> {
    const healthRatio = (vaultData.collateral * vaultData.currentPrice) / vaultData.borrowed;
    const liquidationRatio =
      (vaultData.collateral * vaultData.liquidationPrice) / vaultData.borrowed;

    const prompt = `Assess the risk level for a DeFi vault with these parameters:
- Collateral: ${vaultData.collateral} SOL
- Borrowed: ${vaultData.borrowed} USDC
- Current Price: ${vaultData.currentPrice} USDC/SOL
- Liquidation Price: ${vaultData.liquidationPrice} USDC/SOL
- Health Ratio: ${healthRatio.toFixed(2)}
- Liquidation Ratio: ${liquidationRatio.toFixed(2)}

Provide a brief risk assessment and recommendation. Keep response under 100 words.`;

    const response = await this.sendMessage([{ role: "user", content: prompt }], {
      temperature: 0.3,
      maxTokens: 200,
    });

    // Determine risk level based on health ratio
    let riskLevel: "low" | "medium" | "high" | "critical";
    if (healthRatio > 3) riskLevel = "low";
    else if (healthRatio > 2) riskLevel = "medium";
    else if (healthRatio > 1.5) riskLevel = "high";
    else riskLevel = "critical";

    return {
      riskLevel,
      recommendation: response,
      healthRatio,
    };
  }

  /**
   * Generate market sentiment analysis
   */
  async analyzeMarketSentiment(marketData: {
    recentTransactions: string;
    volumeTrend: string;
    priceAction: string;
  }): Promise<string> {
    const prompt = `Analyze the following market data and provide sentiment analysis for liquidity sniping opportunities:

Recent Transactions:
${marketData.recentTransactions}

Volume Trend:
${marketData.volumeTrend}

Price Action:
${marketData.priceAction}

Provide a brief sentiment analysis (bullish/bearish/neutral) and identify potential opportunities for liquidity sniping.`;

    return this.sendMessage([{ role: "user", content: prompt }], {
      temperature: 0.6,
      maxTokens: 500,
    });
  }

  /**
   * Generate agent instructions for autonomous operation
   */
  async generateAgentInstructions(context: {
    agentName: string;
    currentStrategy: string;
    recentPerformance: string;
    marketConditions: string;
  }): Promise<string> {
    const prompt = `As an autonomous DeFi agent named ${context.agentName}, generate specific instructions for the next 1 hour of operation.

Current Strategy:
${context.currentStrategy}

Recent Performance:
${context.recentPerformance}

Market Conditions:
${context.marketConditions}

Provide clear, executable instructions including:
1. Primary objective
2. Risk parameters
3. Entry/exit conditions
4. Position sizing
5. Emergency stop conditions

Keep instructions concise and actionable.`;

    return this.sendMessage([{ role: "user", content: prompt }], {
      temperature: 0.4,
      maxTokens: 800,
    });
  }

  /**
   * Health check - verify API connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.sendMessage([
        { role: "user", content: "Respond with 'OK' only." },
      ]);
      return response.toLowerCase().includes("ok");
    } catch (error) {
      console.error("[DashScope] Health check failed:", error);
      return false;
    }
  }
}

let client: DashScopeClient | null = null;

export function getDashScopeClient(): DashScopeClient {
  if (!client) {
    client = new DashScopeClient();
  }
  return client;
}

export { DashScopeClient, DashScopeMessage, DashScopeResponse };
