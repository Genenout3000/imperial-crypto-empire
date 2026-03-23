import { describe, it, expect, beforeEach } from "vitest";
import { getDashScopeClient } from "./dashscope-client";
import { getAgenticAgent } from "./agentic-agent";

describe("Alibaba DashScope Integration", () => {
  describe("DashScope Client", () => {
    let client: ReturnType<typeof getDashScopeClient>;

    beforeEach(() => {
      client = getDashScopeClient();
    });

    it("should initialize DashScope client", () => {
      expect(client).toBeDefined();
    });

    it("should have health check method", async () => {
      const isHealthy = await client.healthCheck();
      expect(typeof isHealthy).toBe("boolean");
    });

    it("should analyze strategy", async () => {
      const analysis = await client.analyzeStrategy({
        vaultPositions: "3 active vaults, total collateral: 100 SOL",
        marketConditions: "Bullish trend, high volatility",
        agentPerformance: "Paul: 92% win rate, Ralph: 85% win rate",
      });

      expect(typeof analysis).toBe("string");
      expect(analysis.length).toBeGreaterThan(0);
    });

    it("should assess vault risk", async () => {
      const risk = await client.assessRisk({
        collateral: 10,
        borrowed: 5000,
        currentPrice: 150,
        liquidationPrice: 100,
      });

      expect(risk).toHaveProperty("riskLevel");
      expect(risk).toHaveProperty("recommendation");
      expect(risk).toHaveProperty("healthRatio");
      expect(["low", "medium", "high", "critical"]).toContain(risk.riskLevel);
    });

    it("should analyze market sentiment", async () => {
      const sentiment = await client.analyzeMarketSentiment({
        recentTransactions: "High volume of buys, few sells",
        volumeTrend: "Increasing",
        priceAction: "Strong uptrend",
      });

      expect(typeof sentiment).toBe("string");
      expect(sentiment.length).toBeGreaterThan(0);
    });

    it("should generate agent instructions", async () => {
      const instructions = await client.generateAgentInstructions({
        agentName: "Paul",
        currentStrategy: "Yield harvesting",
        recentPerformance: "92% win rate, +$1200 this week",
        marketConditions: "Bullish, high volatility",
      });

      expect(typeof instructions).toBe("string");
      expect(instructions.length).toBeGreaterThan(0);
    });
  });

  describe("Agentic Agent", () => {
    let agent: ReturnType<typeof getAgenticAgent>;

    beforeEach(() => {
      agent = getAgenticAgent();
    });

    it("should initialize agentic agent", () => {
      expect(agent).toBeDefined();
    });

    it("should make decisions for Paul", async () => {
      const decision = await agent.makeDecision({
        agentName: "Paul",
        currentBalance: 10000,
        recentPerformance: {
          wins: 46,
          losses: 4,
          averageGain: 2.5,
        },
        vaultPositions: [
          { vault: "earn_vault_1", collateral: 50, borrowed: 0 },
        ],
        marketConditions: {
          volatility: 0.15,
          trend: "bullish",
          volume: 1000000,
        },
      });

      expect(decision).toHaveProperty("timestamp");
      expect(decision).toHaveProperty("agentName");
      expect(decision.agentName).toBe("Paul");
      expect(decision).toHaveProperty("decision");
      expect(decision).toHaveProperty("reasoning");
      expect(decision).toHaveProperty("confidence");
      expect(decision).toHaveProperty("actionItems");
      expect(decision.confidence).toBeGreaterThan(0);
      expect(decision.confidence).toBeLessThanOrEqual(1);
    });

    it("should make decisions for Ralph", async () => {
      const decision = await agent.makeDecision({
        agentName: "Ralph",
        currentBalance: 5000,
        recentPerformance: {
          wins: 34,
          losses: 16,
          averageGain: 1.8,
        },
        vaultPositions: [],
        marketConditions: {
          volatility: 0.25,
          trend: "neutral",
          volume: 500000,
        },
      });

      expect(decision.agentName).toBe("Ralph");
      expect(decision.confidence).toBeGreaterThan(0);
    });

    it("should analyze vault risk", async () => {
      const riskAnalysis = await agent.analyzeVaultRisk({
        agentName: "Paul",
        collateral: 10,
        borrowed: 5000,
        currentPrice: 150,
        liquidationPrice: 100,
      });

      expect(riskAnalysis).toHaveProperty("riskLevel");
      expect(riskAnalysis).toHaveProperty("recommendation");
      expect(riskAnalysis).toHaveProperty("suggestedAction");
      expect(["low", "medium", "high", "critical"]).toContain(riskAnalysis.riskLevel);
      expect(["HOLD", "REDUCE_POSITION", "INCREASE_POSITION", "EMERGENCY_REPAY"]).toContain(
        riskAnalysis.suggestedAction
      );
    });

    it("should get market sentiment", async () => {
      const sentiment = await agent.getMarketSentiment({
        recentTransactions: "High volume of buys",
        volumeTrend: "Increasing",
        priceAction: "Strong uptrend",
      });

      expect(sentiment).toHaveProperty("sentiment");
      expect(sentiment).toHaveProperty("confidence");
      expect(sentiment).toHaveProperty("opportunities");
      expect(["bullish", "bearish", "neutral"]).toContain(sentiment.sentiment);
      expect(sentiment.confidence).toBeGreaterThan(0);
      expect(sentiment.confidence).toBeLessThanOrEqual(1);
      expect(Array.isArray(sentiment.opportunities)).toBe(true);
    });

    it("should maintain decision history", async () => {
      const decision1 = await agent.makeDecision({
        agentName: "Paul",
        currentBalance: 10000,
        recentPerformance: { wins: 46, losses: 4, averageGain: 2.5 },
        vaultPositions: [],
        marketConditions: {
          volatility: 0.15,
          trend: "bullish",
          volume: 1000000,
        },
      });

      const history = agent.getDecisionHistory("Paul");
      expect(history.length).toBeGreaterThan(0);
      expect(history[history.length - 1].agentName).toBe("Paul");
    });

    it("should perform health check", async () => {
      const isHealthy = await agent.healthCheck();
      expect(typeof isHealthy).toBe("boolean");
    });

    it("should handle errors gracefully", async () => {
      // Test with invalid data should still return a decision
      const decision = await agent.makeDecision({
        agentName: "Paul",
        currentBalance: 0,
        recentPerformance: { wins: 0, losses: 0, averageGain: 0 },
        vaultPositions: [],
        marketConditions: {
          volatility: 0,
          trend: "neutral",
          volume: 0,
        },
      });

      expect(decision).toBeDefined();
      expect(decision.decision).toBeDefined();
    });
  });

  describe("Singleton Pattern", () => {
    it("should return same DashScope client instance", () => {
      const client1 = getDashScopeClient();
      const client2 = getDashScopeClient();
      expect(client1).toBe(client2);
    });

    it("should return same agentic agent instance", () => {
      const agent1 = getAgenticAgent();
      const agent2 = getAgenticAgent();
      expect(agent1).toBe(agent2);
    });
  });

  describe("Integration Scenarios", () => {
    let agent: ReturnType<typeof getAgenticAgent>;

    beforeEach(() => {
      agent = getAgenticAgent();
    });

    it("should handle Paul yield harvesting scenario", async () => {
      const decision = await agent.makeDecision({
        agentName: "Paul",
        currentBalance: 50000,
        recentPerformance: {
          wins: 92,
          losses: 8,
          averageGain: 3.2,
        },
        vaultPositions: [
          { vault: "earn_vault_1", collateral: 25000, borrowed: 0 },
          { vault: "earn_vault_2", collateral: 15000, borrowed: 0 },
        ],
        marketConditions: {
          volatility: 0.12,
          trend: "bullish",
          volume: 2000000,
        },
      });

      expect(decision.agentName).toBe("Paul");
      expect(decision.actionItems.length).toBeGreaterThan(0);
    });

    it("should handle Ralph liquidity sniping scenario", async () => {
      const decision = await agent.makeDecision({
        agentName: "Ralph",
        currentBalance: 10000,
        recentPerformance: {
          wins: 85,
          losses: 15,
          averageGain: 1.5,
        },
        vaultPositions: [],
        marketConditions: {
          volatility: 0.3,
          trend: "bullish",
          volume: 5000000,
        },
      });

      expect(decision.agentName).toBe("Ralph");
      expect(decision.confidence).toBeGreaterThan(0);
    });

    it("should assess critical vault risk and recommend action", async () => {
      const riskAnalysis = await agent.analyzeVaultRisk({
        agentName: "Paul",
        collateral: 5,
        borrowed: 5000,
        currentPrice: 110,
        liquidationPrice: 100,
      });

      expect(riskAnalysis.riskLevel).toBe("critical");
      expect(riskAnalysis.suggestedAction).toBe("EMERGENCY_REPAY");
    });
  });
});
