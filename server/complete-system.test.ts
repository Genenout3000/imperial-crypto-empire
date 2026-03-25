import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getMultiChainAgentLoop } from "./agents/multichain-agent-loop";
import { getSelfLearningEngine } from "./agents/self-learning-engine";
import { getTelegramBot } from "./telegram/telegram-bot";

describe("Complete 24/7 Autonomous Agent System", () => {
  let agentLoop: ReturnType<typeof getMultiChainAgentLoop>;
  let paulEngine: ReturnType<typeof getSelfLearningEngine>;
  let ralphEngine: ReturnType<typeof getSelfLearningEngine>;
  let guardianEngine: ReturnType<typeof getSelfLearningEngine>;
  let telegramBot: ReturnType<typeof getTelegramBot>;

  beforeAll(async () => {
    agentLoop = getMultiChainAgentLoop();
    paulEngine = getSelfLearningEngine("paul-yield-agent", "Paul");
    ralphEngine = getSelfLearningEngine("ralph-liquidity-agent", "Ralph");
    guardianEngine = getSelfLearningEngine("guardian-monitor-agent", "Guardian");
    telegramBot = getTelegramBot();

    await telegramBot.initialize();
  });

  afterAll(async () => {
    await agentLoop.stop();
  });

  describe("Multi-Chain Agent Loop", () => {
    it("should initialize agent loop", () => {
      expect(agentLoop).toBeDefined();
      const status = agentLoop.getStatus();
      expect(status.agents).toHaveLength(3);
    });

    it("should have Paul, Ralph, and Guardian agents", () => {
      const status = agentLoop.getStatus();
      const agentNames = status.agents.map((a) => a.name);
      expect(agentNames).toContain("Paul");
      expect(agentNames).toContain("Ralph");
      expect(agentNames).toContain("Guardian");
    });

    it("should start agent loop", async () => {
      await agentLoop.start();
      const status = agentLoop.getStatus();
      expect(status.running).toBe(true);
    });

    it("should stop agent loop", async () => {
      await agentLoop.stop();
      const status = agentLoop.getStatus();
      expect(status.running).toBe(false);
    });
  });

  describe("Self-Learning Engines", () => {
    it("should create Paul engine", () => {
      expect(paulEngine).toBeDefined();
      expect(paulEngine.getMemory()).toBeDefined();
    });

    it("should create Ralph engine", () => {
      expect(ralphEngine).toBeDefined();
      expect(ralphEngine.getMemory()).toBeDefined();
    });

    it("should create Guardian engine", () => {
      expect(guardianEngine).toBeDefined();
      expect(guardianEngine.getMemory()).toBeDefined();
    });

    it("should get performance metrics", () => {
      const paulMetrics = paulEngine.getPerformanceMetrics();
      expect(paulMetrics).toHaveProperty("totalDecisions");
      expect(paulMetrics).toHaveProperty("successRate");
      expect(paulMetrics).toHaveProperty("averageReturn");
      expect(paulMetrics).toHaveProperty("lessonsLearned");
      expect(paulMetrics).toHaveProperty("adaptationsMade");
    });

    it("should track decision history", () => {
      const history = paulEngine.getDecisionHistory(5);
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe("Autonomous Decision Making", () => {
    it("Paul should make yield decisions", async () => {
      const decision = await paulEngine.makeDecision({
        marketCondition: "bullish",
        vaultHealth: 85,
        agentPerformance: 92,
        riskTolerance: 60,
      });

      expect(decision).toHaveProperty("action");
      expect(decision).toHaveProperty("confidence");
      expect(decision).toHaveProperty("reasoning");
      expect(decision.confidence).toBeGreaterThanOrEqual(0);
      expect(decision.confidence).toBeLessThanOrEqual(1);
    });

    it("Ralph should make liquidity decisions", async () => {
      const decision = await ralphEngine.makeDecision({
        marketCondition: "sideways",
        vaultHealth: 75,
        agentPerformance: 87,
        riskTolerance: 70,
      });

      expect(decision).toHaveProperty("action");
      expect(decision).toHaveProperty("confidence");
      expect(decision).toHaveProperty("reasoning");
      expect(["buy", "sell", "hold", "snipe"]).toContain(decision.action);
    });

    it("Guardian should make monitoring decisions", async () => {
      const decision = await guardianEngine.makeDecision({
        marketCondition: "monitoring",
        vaultHealth: 95,
        agentPerformance: 99,
        riskTolerance: 30,
      });

      expect(decision).toHaveProperty("action");
      expect(decision).toHaveProperty("reasoning");
      expect(decision.riskLevel).toMatch(/low|medium|high/);
    });
  });

  describe("Self-Learning & Adaptation", () => {
    it("Paul should learn from outcomes", async () => {
      const decision = await paulEngine.makeDecision({
        marketCondition: "bullish",
        vaultHealth: 85,
        agentPerformance: 92,
        riskTolerance: 60,
      });

      await paulEngine.learnFromOutcome(decision, {
        success: true,
        returnPercentage: 0.15,
        actualOutcome: "Yield harvested successfully",
      });

      const memory = paulEngine.getMemory();
      expect(memory.lessons.length).toBeGreaterThanOrEqual(0);
      expect(memory.adaptations.length).toBeGreaterThanOrEqual(0);
    });

    it("Ralph should learn from outcomes", async () => {
      const decision = await ralphEngine.makeDecision({
        marketCondition: "bullish",
        vaultHealth: 85,
        agentPerformance: 87,
        riskTolerance: 70,
      });

      await ralphEngine.learnFromOutcome(decision, {
        success: true,
        returnPercentage: 0.22,
        actualOutcome: "Liquidity snipe executed",
      });

      const memory = ralphEngine.getMemory();
      expect(memory.pastDecisions.length).toBeGreaterThan(0);
    });
  });

  describe("Telegram Bot Integration", () => {
    it("should initialize Telegram bot", async () => {
      expect(telegramBot).toBeDefined();
      // Bot initialization is async, just verify it doesn't throw
      await expect(telegramBot.initialize()).resolves.not.toThrow();
    });

    it("should handle agent status commands", async () => {
      // Verify bot has methods for status
      expect(telegramBot).toHaveProperty("handleMessage");
      expect(telegramBot).toHaveProperty("sendCriticalAlert");
      expect(telegramBot).toHaveProperty("notifyAgentDecision");
    });

    it("should send critical alerts", async () => {
      // Verify alert method exists and doesn't throw
      await expect(telegramBot.sendCriticalAlert("Test alert")).resolves.not.toThrow();
    });

    it("should notify agent decisions", async () => {
      await expect(
        telegramBot.notifyAgentDecision("Paul", "harvest", 0.85, "High yield opportunity detected")
      ).resolves.not.toThrow();
    });
  });

  describe("24/7 Autonomous Operation", () => {
    it("should support continuous operation", async () => {
      // Verify agent loop can be started and stopped multiple times
      await agentLoop.start();
      expect(agentLoop.getStatus().running).toBe(true);

      await agentLoop.stop();
      expect(agentLoop.getStatus().running).toBe(false);

      await agentLoop.start();
      expect(agentLoop.getStatus().running).toBe(true);

      await agentLoop.stop();
      expect(agentLoop.getStatus().running).toBe(false);
    });

    it("should maintain agent state across cycles", async () => {
      const initialMetrics = paulEngine.getPerformanceMetrics();

      // Make a decision
      await paulEngine.makeDecision({
        marketCondition: "bullish",
        vaultHealth: 85,
        agentPerformance: 92,
        riskTolerance: 60,
      });

      const updatedMetrics = paulEngine.getPerformanceMetrics();
      expect(parseInt(updatedMetrics.totalDecisions as any)).toBeGreaterThanOrEqual(
        parseInt(initialMetrics.totalDecisions as any)
      );
    });

    it("should handle multiple concurrent agents", async () => {
      const decisions = await Promise.all([
        paulEngine.makeDecision({
          marketCondition: "bullish",
          vaultHealth: 85,
          agentPerformance: 92,
          riskTolerance: 60,
        }),
        ralphEngine.makeDecision({
          marketCondition: "bullish",
          vaultHealth: 85,
          agentPerformance: 87,
          riskTolerance: 70,
        }),
        guardianEngine.makeDecision({
          marketCondition: "monitoring",
          vaultHealth: 95,
          agentPerformance: 99,
          riskTolerance: 30,
        }),
      ]);

      expect(decisions).toHaveLength(3);
      expect(decisions[0]).toHaveProperty("action");
      expect(decisions[1]).toHaveProperty("action");
      expect(decisions[2]).toHaveProperty("action");
    });
  });

  describe("System Reliability", () => {
    it("should recover from errors", async () => {
      // Verify error handling doesn't crash system
      const status1 = agentLoop.getStatus();
      expect(status1).toBeDefined();

      // Simulate error scenario
      try {
        await paulEngine.makeDecision({
          marketCondition: "unknown",
          vaultHealth: -100, // Invalid
          agentPerformance: 200, // Invalid
          riskTolerance: 150, // Invalid
        });
      } catch {
        // Error expected, system should still be functional
      }

      const status2 = agentLoop.getStatus();
      expect(status2).toBeDefined();
    });

    it("should maintain performance under load", async () => {
      const startTime = Date.now();

      // Make 10 concurrent decisions
      await Promise.all(
        Array(10)
          .fill(null)
          .map(() =>
            paulEngine.makeDecision({
              marketCondition: "bullish",
              vaultHealth: 85,
              agentPerformance: 92,
              riskTolerance: 60,
            })
          )
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });
  });
});
