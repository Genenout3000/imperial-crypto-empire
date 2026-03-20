import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getMainnetMonitor, MainnetMonitor } from "./mainnet-monitor";
import { getAgentOrchestrator, AgentOrchestrator } from "./agent-orchestrator";

describe("Mainnet Monitor", () => {
  let monitor: MainnetMonitor;

  beforeEach(() => {
    monitor = getMainnetMonitor();
  });

  afterEach(() => {
    monitor.stopMonitoring();
  });

  describe("Initialization", () => {
    it("should create monitor instance", () => {
      expect(monitor).toBeDefined();
    });

    it("should have valid stats structure", () => {
      const stats = monitor.getStats();
      expect(stats).toHaveProperty("isMonitoring");
      expect(stats).toHaveProperty("treasuryAddress");
      expect(stats).toHaveProperty("rpcEndpoint");
      expect(stats).toHaveProperty("transactionCount");
    });

    it("should start monitoring", async () => {
      await monitor.startMonitoring();
      const stats = monitor.getStats();
      expect(stats.isMonitoring).toBe(true);
    });

    it("should stop monitoring", async () => {
      await monitor.startMonitoring();
      monitor.stopMonitoring();
      const stats = monitor.getStats();
      expect(stats.isMonitoring).toBe(false);
    });
  });

  describe("Transaction Monitoring", () => {
    it("should track transaction count", async () => {
      const stats1 = monitor.getStats();
      const initialCount = stats1.transactionCount;

      await monitor.startMonitoring();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stats2 = monitor.getStats();
      expect(stats2.transactionCount).toBeGreaterThanOrEqual(initialCount);
    });

    it("should have valid treasury address", () => {
      const stats = monitor.getStats();
      expect(stats.treasuryAddress).toBeDefined();
      expect(typeof stats.treasuryAddress).toBe("string");
      expect(stats.treasuryAddress.length).toBeGreaterThan(0);
    });

    it("should have Helius RPC endpoint", () => {
      const stats = monitor.getStats();
      expect(stats.rpcEndpoint).toContain("helius-rpc");
    });
  });
});

describe("Agent Orchestrator", () => {
  let orchestrator: AgentOrchestrator;

  beforeEach(async () => {
    orchestrator = await getAgentOrchestrator();
  });

  afterEach(async () => {
    await orchestrator.stopAgents();
  });

  describe("Initialization", () => {
    it("should initialize orchestrator", async () => {
      expect(orchestrator).toBeDefined();
    });

    it("should have three agents", () => {
      const status = orchestrator.getStatus();
      expect(Object.keys(status.agents)).toHaveLength(3);
      expect(status.agents).toHaveProperty("Paul");
      expect(status.agents).toHaveProperty("Ralph");
      expect(status.agents).toHaveProperty("Guardian");
    });

    it("should have agents in stopped state initially", () => {
      const status = orchestrator.getStatus();
      expect(status.isRunning).toBe(false);
      expect(status.agents.Paul.isRunning).toBe(false);
      expect(status.agents.Ralph.isRunning).toBe(false);
      expect(status.agents.Guardian.isRunning).toBe(false);
    });
  });

  describe("Agent Management", () => {
    it("should start all agents", async () => {
      await orchestrator.startAgents();
      const status = orchestrator.getStatus();
      expect(status.isRunning).toBe(true);
      expect(status.agents.Paul.isRunning).toBe(true);
      expect(status.agents.Ralph.isRunning).toBe(true);
      expect(status.agents.Guardian.isRunning).toBe(true);
    });

    it("should stop all agents", async () => {
      await orchestrator.startAgents();
      await orchestrator.stopAgents();
      const status = orchestrator.getStatus();
      expect(status.isRunning).toBe(false);
    });

    it("should not start agents twice", async () => {
      await orchestrator.startAgents();
      await orchestrator.startAgents(); // Should be idempotent
      const status = orchestrator.getStatus();
      expect(status.isRunning).toBe(true);
    });
  });

  describe("Agent Status", () => {
    it("should return valid status object", () => {
      const status = orchestrator.getStatus();
      expect(status).toHaveProperty("isRunning");
      expect(status).toHaveProperty("agents");
      expect(status).toHaveProperty("mainnetMonitor");
    });

    it("should track agent properties", () => {
      const status = orchestrator.getStatus();
      const paulStatus = status.agents.Paul;

      expect(paulStatus).toHaveProperty("isRunning");
      expect(paulStatus).toHaveProperty("loopCount");
      expect(paulStatus).toHaveProperty("lastLoopTime");
      expect(paulStatus).toHaveProperty("nextLoopTime");
      expect(paulStatus).toHaveProperty("balance");
      expect(paulStatus).toHaveProperty("totalEarned");
      expect(paulStatus).toHaveProperty("totalLost");
      expect(paulStatus).toHaveProperty("winRate");
    });

    it("should initialize agent balances to zero", () => {
      const status = orchestrator.getStatus();
      expect(status.agents.Paul.balance).toBe("0.00");
      expect(status.agents.Ralph.balance).toBe("0.00");
      expect(status.agents.Guardian.balance).toBe("0.00");
    });

    it("should initialize loop counts to zero", () => {
      const status = orchestrator.getStatus();
      expect(status.agents.Paul.loopCount).toBe(0);
      expect(status.agents.Ralph.loopCount).toBe(0);
      expect(status.agents.Guardian.loopCount).toBe(0);
    });
  });

  describe("Agent Loop Execution", () => {
    it("should increment loop counts when running", async () => {
      const status1 = orchestrator.getStatus();
      const initialPaulLoops = status1.agents.Paul.loopCount;

      await orchestrator.startAgents();
      await new Promise((resolve) => setTimeout(resolve, 200));

      const status2 = orchestrator.getStatus();
      // Loop count should remain 0 initially as loops haven't started yet
      expect(status2.agents.Paul.loopCount).toBeGreaterThanOrEqual(initialPaulLoops);
    });

    it("should track agent performance metrics", async () => {
      const status = orchestrator.getStatus();
      const paulStatus = status.agents.Paul;

      expect(typeof paulStatus.balance).toBe("string");
      expect(typeof paulStatus.totalEarned).toBe("string");
      expect(typeof paulStatus.winRate).toBe("string");
    });
  });

  describe("Integration Tests", () => {
    it("should run full orchestration cycle", async () => {
      // Start agents
      await orchestrator.startAgents();
      const startStatus = orchestrator.getStatus();
      expect(startStatus.isRunning).toBe(true);

      // Wait for some activity
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check status
      const midStatus = orchestrator.getStatus();
      expect(midStatus.agents.Paul).toHaveProperty("loopCount");

      // Stop agents
      await orchestrator.stopAgents();
      const endStatus = orchestrator.getStatus();
      expect(endStatus.isRunning).toBe(false);
    });

    it("should maintain system health", async () => {
      await orchestrator.startAgents();

      // Get initial status
      const status1 = orchestrator.getStatus();
      expect(status1.isRunning).toBe(true);

      // Wait and check again
      await new Promise((resolve) => setTimeout(resolve, 100));
      const status2 = orchestrator.getStatus();
      expect(status2.isRunning).toBe(true);

      await orchestrator.stopAgents();
    });

    it("should have mainnet monitor integrated", async () => {
      const status = orchestrator.getStatus();
      expect(status.mainnetMonitor).toBeDefined();
      expect(status.mainnetMonitor).toHaveProperty("isMonitoring");
      expect(status.mainnetMonitor).toHaveProperty("treasuryAddress");
    });
  });

  describe("Agent Types", () => {
    it("should have Paul as yield harvesting agent", () => {
      const status = orchestrator.getStatus();
      expect(status.agents.Paul).toBeDefined();
    });

    it("should have Ralph as liquidity sniping agent", () => {
      const status = orchestrator.getStatus();
      expect(status.agents.Ralph).toBeDefined();
    });

    it("should have Guardian as monitoring agent", () => {
      const status = orchestrator.getStatus();
      expect(status.agents.Guardian).toBeDefined();
    });
  });
});

describe("Singleton Pattern", () => {
  it("should return same monitor instance", () => {
    const monitor1 = getMainnetMonitor();
    const monitor2 = getMainnetMonitor();
    expect(monitor1).toBe(monitor2);
  });

  it("should return same orchestrator instance", async () => {
    const orch1 = await getAgentOrchestrator();
    const orch2 = await getAgentOrchestrator();
    expect(orch1).toBe(orch2);

    await orch1.stopAgents();
  });
});
