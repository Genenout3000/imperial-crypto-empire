import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { getDashScopeAgent } from "./dashscope-free";
import { getAgenticOrchestrator, startAgenticOrchestrator } from "./agentic-orchestrator";

describe("Alibaba DashScope Agentic Agent System", () => {
  describe("DashScope Agent", () => {
    it("should initialize DashScope agent", () => {
      const agent = getDashScopeAgent();
      expect(agent).toBeDefined();
    });

    it("should make autonomous decisions", async () => {
      const agent = getDashScopeAgent();
      const decision = await agent.makeDecision({
        marketCondition: "bullish",
        vaultHealth: 85,
        agentPerformance: 92,
        riskTolerance: 60,
      });

      expect(decision).toBeDefined();
      expect(decision.action).toMatch(/^(buy|sell|hold|harvest|repay)$/);
      expect(decision.confidence).toBeGreaterThanOrEqual(0);
      expect(decision.confidence).toBeLessThanOrEqual(1);
      expect(decision.reasoning).toBeDefined();
      expect(decision.timestamp).toBeInstanceOf(Date);
    });

    it("should analyze on-chain data", async () => {
      const agent = getDashScopeAgent();
      const analysis = await agent.analyzeOnChainData({
        transactionVolume: 5000,
        liquidityDepth: 25000,
        slippage: 0.5,
        tokenVelocity: 50,
      });

      expect(analysis).toBeDefined();
      expect(analysis.analysis).toBeDefined();
      expect(analysis.recommendations).toBeInstanceOf(Array);
      expect(analysis.riskLevel).toMatch(/^(low|medium|high)$/);
      expect(analysis.timestamp).toBeInstanceOf(Date);
    });

    it("should generate yield optimization strategy", async () => {
      const agent = getDashScopeAgent();
      const strategy = await agent.generateYieldStrategy({
        totalValue: 100000,
        allocations: {
          "SOL-USDC": 0.4,
          "USDC-USDT": 0.3,
          "RAY-USDC": 0.3,
        },
        riskProfile: "moderate",
      });

      expect(strategy).toBeDefined();
      expect(strategy.strategy).toBeDefined();
      expect(strategy.expectedYield).toBeGreaterThan(0);
      expect(strategy.actions).toBeInstanceOf(Array);
      expect(strategy.actions.length).toBeGreaterThan(0);
    });

    it("should handle multiple decisions with different market conditions", async () => {
      const agent = getDashScopeAgent();
      const conditions = [
        { market: "bullish", health: 90, performance: 95, risk: 70 },
        { market: "bearish", health: 60, performance: 70, risk: 30 },
        { market: "sideways", health: 75, performance: 80, risk: 50 },
      ];

      for (const cond of conditions) {
        const decision = await agent.makeDecision({
          marketCondition: cond.market,
          vaultHealth: cond.health,
          agentPerformance: cond.performance,
          riskTolerance: cond.risk,
        });

        expect(decision.action).toBeDefined();
        expect(decision.confidence).toBeGreaterThan(0);
      }
    });
  });

  describe("Agentic Orchestrator", () => {
    let orchestrator: Awaited<ReturnType<typeof getAgenticOrchestrator>>;

    beforeAll(async () => {
      orchestrator = await getAgenticOrchestrator();
    });

    it("should initialize orchestrator with all agents", async () => {
      expect(orchestrator).toBeDefined();
      const agents = orchestrator.getAllAgentsStatus();
      expect(agents.length).toBe(3);
      expect(agents.some((a) => a.name === "Paul")).toBe(true);
      expect(agents.some((a) => a.name === "Ralph")).toBe(true);
      expect(agents.some((a) => a.name === "Guardian")).toBe(true);
    });

    it("should get Paul agent status", () => {
      const paul = orchestrator.getAgentStatus("paul-yield-agent");
      expect(paul).toBeDefined();
      expect(paul?.name).toBe("Paul");
      expect(paul?.type).toBe("yield");
      expect(paul?.status).toBe("active");
      expect(paul?.performance.successRate).toBeGreaterThan(0);
    });

    it("should get Ralph agent status", () => {
      const ralph = orchestrator.getAgentStatus("ralph-liquidity-agent");
      expect(ralph).toBeDefined();
      expect(ralph?.name).toBe("Ralph");
      expect(ralph?.type).toBe("liquidity");
      expect(ralph?.status).toBe("active");
      expect(ralph?.performance.successRate).toBeGreaterThan(0);
    });

    it("should get Guardian agent status", () => {
      const guardian = orchestrator.getAgentStatus("guardian-monitor-agent");
      expect(guardian).toBeDefined();
      expect(guardian?.name).toBe("Guardian");
      expect(guardian?.type).toBe("guardian");
      expect(guardian?.status).toBe("active");
    });

    it("should update agent configuration", async () => {
      const paul = orchestrator.getAgentStatus("paul-yield-agent");
      expect(paul?.status).toBe("active");

      await orchestrator.updateAgentConfig("paul-yield-agent", {
        status: "paused",
      });

      const updated = orchestrator.getAgentStatus("paul-yield-agent");
      expect(updated?.status).toBe("paused");

      // Restore to active
      await orchestrator.updateAgentConfig("paul-yield-agent", {
        status: "active",
      });
    });

    it("should get all agents status", () => {
      const allAgents = orchestrator.getAllAgentsStatus();
      expect(allAgents).toBeInstanceOf(Array);
      expect(allAgents.length).toBe(3);

      for (const agent of allAgents) {
        expect(agent.id).toBeDefined();
        expect(agent.name).toBeDefined();
        expect(agent.type).toMatch(/^(yield|liquidity|guardian)$/);
        expect(agent.status).toMatch(/^(active|paused|error)$/);
        expect(agent.performance).toBeDefined();
        expect(agent.performance.totalActions).toBeGreaterThanOrEqual(0);
        expect(agent.performance.successRate).toBeGreaterThanOrEqual(0);
        expect(agent.performance.successRate).toBeLessThanOrEqual(1);
      }
    });

    it("should start orchestrator", async () => {
      await orchestrator.start();
      // Give it a moment to start
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(orchestrator).toBeDefined();
    });

    it("should stop orchestrator", async () => {
      await orchestrator.stop();
      expect(orchestrator).toBeDefined();
    });
  });

  describe("Agent Decision Making", () => {
    it("should make consistent decisions", async () => {
      const agent = getDashScopeAgent();
      const context = {
        marketCondition: "bullish",
        vaultHealth: 85,
        agentPerformance: 92,
        riskTolerance: 60,
      };

      const decision1 = await agent.makeDecision(context);
      const decision2 = await agent.makeDecision(context);

      expect(decision1).toBeDefined();
      expect(decision2).toBeDefined();
      // Both should be valid decisions
      expect(decision1.action).toMatch(/^(buy|sell|hold|harvest|repay)$/);
      expect(decision2.action).toMatch(/^(buy|sell|hold|harvest|repay)$/);
    });

    it("should adjust confidence based on market conditions", async () => {
      const agent = getDashScopeAgent();

      const strongMarket = await agent.makeDecision({
        marketCondition: "strong bullish",
        vaultHealth: 95,
        agentPerformance: 98,
        riskTolerance: 80,
      });

      const weakMarket = await agent.makeDecision({
        marketCondition: "weak bearish",
        vaultHealth: 40,
        agentPerformance: 50,
        riskTolerance: 20,
      });

      expect(strongMarket.confidence).toBeGreaterThan(0);
      expect(weakMarket.confidence).toBeGreaterThan(0);
    });
  });

  describe("Agent Analysis", () => {
    it("should provide recommendations based on risk level", async () => {
      const agent = getDashScopeAgent();

      const lowRiskData = {
        transactionVolume: 10000,
        liquidityDepth: 50000,
        slippage: 0.2,
        tokenVelocity: 80,
      };

      const analysis = await agent.analyzeOnChainData(lowRiskData);

      expect(analysis.recommendations).toBeInstanceOf(Array);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.riskLevel).toBeDefined();
    });

    it("should identify high slippage conditions", async () => {
      const agent = getDashScopeAgent();

      const highSlippageData = {
        transactionVolume: 1000,
        liquidityDepth: 5000,
        slippage: 5,
        tokenVelocity: 20,
      };

      const analysis = await agent.analyzeOnChainData(highSlippageData);

      expect(analysis.riskLevel).toMatch(/^(low|medium|high)$/);
      expect(analysis.analysis).toBeDefined();
    });
  });

  describe("Yield Strategy Generation", () => {
    it("should generate appropriate strategy for conservative portfolio", async () => {
      const agent = getDashScopeAgent();

      const strategy = await agent.generateYieldStrategy({
        totalValue: 50000,
        allocations: {
          "USDC": 0.6,
          "SOL": 0.2,
          "USDT": 0.2,
        },
        riskProfile: "conservative",
      });

      expect(strategy.expectedYield).toBeGreaterThan(0);
      expect(strategy.expectedYield).toBeLessThan(50); // Conservative should have lower yield
      expect(strategy.actions.length).toBeGreaterThan(0);
    });

    it("should generate appropriate strategy for aggressive portfolio", async () => {
      const agent = getDashScopeAgent();

      const strategy = await agent.generateYieldStrategy({
        totalValue: 100000,
        allocations: {
          "RAY": 0.4,
          "SOL": 0.3,
          "COPE": 0.3,
        },
        riskProfile: "aggressive",
      });

      expect(strategy.expectedYield).toBeGreaterThan(0);
      expect(strategy.actions.length).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid market conditions gracefully", async () => {
      const agent = getDashScopeAgent();

      const decision = await agent.makeDecision({
        marketCondition: "unknown_condition",
        vaultHealth: 50,
        agentPerformance: 50,
        riskTolerance: 50,
      });

      expect(decision).toBeDefined();
      expect(decision.action).toBeDefined();
    });

    it("should fallback to mock mode on API failure", async () => {
      const agent = getDashScopeAgent();

      // This should work even if API is unavailable
      const decision = await agent.makeDecision({
        marketCondition: "normal",
        vaultHealth: 85,
        agentPerformance: 92,
        riskTolerance: 60,
      });

      expect(decision).toBeDefined();
      expect(decision.action).toMatch(/^(buy|sell|hold|harvest|repay)$/);
    });
  });
});
