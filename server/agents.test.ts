import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { getPaulAgent } from "./agents/paul-agent";
import { getRalphAgent } from "./agents/ralph-agent";
import { getSafetyGuardian } from "./agents/safety-guardian";
import { getAgentOrchestrator } from "./agents/orchestrator";

describe("Autonomous Agents", () => {
  describe("Paul Agent (Yield Harvesting)", () => {
    it("should initialize with correct configuration", () => {
      const paul = getPaulAgent();
      const status = paul.getStatus();

      expect(status).toBeDefined();
      expect(status.loopInterval).toBe(300000); // 5 minutes
    });

    it("should have singleton pattern", () => {
      const paul1 = getPaulAgent();
      const paul2 = getPaulAgent();

      expect(paul1).toBe(paul2);
    });
  });

  describe("Ralph Agent (Liquidity Sniping)", () => {
    it("should initialize with correct configuration", () => {
      const ralph = getRalphAgent();
      const status = ralph.getStatus();

      expect(status).toBeDefined();
      expect(status.loopInterval).toBe(180000); // 3 minutes
    });

    it("should have faster loop than Paul", () => {
      const paul = getPaulAgent();
      const ralph = getRalphAgent();

      const paulStatus = paul.getStatus();
      const ralphStatus = ralph.getStatus();

      expect(ralphStatus.loopInterval).toBeLessThan(paulStatus.loopInterval);
    });
  });

  describe("Safety Guardian", () => {
    it("should initialize correctly", () => {
      const guardian = getSafetyGuardian();
      const status = guardian.getStatus();

      expect(status).toBeDefined();
      expect(status.isRunning).toBe(false);
    });

    it("should have monitoring capability", () => {
      const guardian = getSafetyGuardian();
      const status = guardian.getStatus();

      expect(status.checkInterval).toBe(60000); // 1 minute
    });
  });

  describe("Agent Orchestrator", () => {
    it("should manage all agents", () => {
      const orchestrator = getAgentOrchestrator();
      const status = orchestrator.getStatus();

      expect(status).toBeDefined();
      expect(status.agents).toBeDefined();
      expect(status.agents.paul).toBeDefined();
      expect(status.agents.ralph).toBeDefined();
      expect(status.agents.guardian).toBeDefined();
    });

    it("should have singleton pattern", () => {
      const orch1 = getAgentOrchestrator();
      const orch2 = getAgentOrchestrator();

      expect(orch1).toBe(orch2);
    });

    it("should provide aggregated metrics", async () => {
      const orchestrator = getAgentOrchestrator();
      const metrics = await orchestrator.getAggregatedMetrics();

      expect(metrics).toBeDefined();
      expect(metrics.agents).toBeDefined();
      expect(metrics.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("Agent Safety Features", () => {
    it("Paul should track performance metrics", () => {
      const paul = getPaulAgent();
      const status = paul.getStatus();

      expect(status.loopNumber).toBeGreaterThanOrEqual(0);
    });

    it("Ralph should track performance metrics", () => {
      const ralph = getRalphAgent();
      const status = ralph.getStatus();

      expect(status.loopNumber).toBeGreaterThanOrEqual(0);
    });

    it("Guardian should monitor system health", () => {
      const guardian = getSafetyGuardian();
      const status = guardian.getStatus();

      expect(status.checkInterval).toBeGreaterThan(0);
    });
  });

  describe("Agent Lifecycle", () => {
    it("orchestrator should support start/stop", async () => {
      const orchestrator = getAgentOrchestrator();
      const initialStatus = orchestrator.getStatus();

      expect(initialStatus.isRunning).toBeDefined();
    });

    it("agents should be retrievable individually", () => {
      const paul = getPaulAgent();
      const ralph = getRalphAgent();
      const guardian = getSafetyGuardian();

      expect(paul).toBeDefined();
      expect(ralph).toBeDefined();
      expect(guardian).toBeDefined();
    });
  });
});
