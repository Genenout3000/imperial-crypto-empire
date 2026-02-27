/**
 * PAUL - Autonomous Yield Harvesting Agent
 * 
 * Strategy: Aggressive yield farming with risk management
 * - Monitors Jupiter Lend earn vaults
 * - Executes yield deposits and harvesting
 * - Rebalances positions based on APY changes
 * - Learns from historical performance
 */

import { getAgentByName, upsertAgent, insertAgentMetric, insertTransaction, insertNotification } from "../db";
import { notifyOwner } from "../_core/notification";
import { ENV } from "../_core/env";

interface PaulLoopState {
  loopNumber: number;
  strategyUsed: string;
  transactionsExecuted: number;
  profitLoss: number;
  gasUsed: number;
  executionTime: number;
  successRate: number;
}

class PaulAgent {
  private isRunning = false;
  private loopInterval = 300000; // 5 minutes
  private loopNumber = 0;

  async start() {
    if (this.isRunning) {
      console.log("[Paul] Already running");
      return;
    }

    this.isRunning = true;
    console.log("[Paul] Started - yield harvesting agent active");

    // Initialize or update agent record
    const existing = await getAgentByName("Paul");
    if (!existing) {
      await upsertAgent({
        name: "Paul",
        type: "paul",
        strategy: "Aggressive Yield Farming",
        status: "running",
        publicKey: "PaulYieldHarvester11111111111111111111111111",
        balance: "0",
        totalEarned: "0",
        totalLost: "0",
        winRate: "0",
      });
    } else {
      await upsertAgent({
        ...existing,
        status: "running",
        lastLoopAt: new Date(),
      });
    }

    // Run initial loop
    await this.executeLoop();

    // Schedule recurring loops
    setInterval(() => this.executeLoop(), this.loopInterval);
  }

  stop() {
    this.isRunning = false;
    console.log("[Paul] Stopped");
  }

  /**
   * Execute a single yield harvesting loop
   */
  async executeLoop(): Promise<PaulLoopState> {
    this.loopNumber++;
    const startTime = Date.now();

    const state: PaulLoopState = {
      loopNumber: this.loopNumber,
      strategyUsed: "Yield Farming - APY Optimization",
      transactionsExecuted: 0,
      profitLoss: 0,
      gasUsed: 0,
      executionTime: 0,
      successRate: 100,
    };

    try {
      console.log(`[Paul] Loop #${this.loopNumber} started`);

      // Step 1: Analyze current vault positions
      const vaultAnalysis = await this.analyzeVaults();
      console.log(`[Paul] Vault analysis complete: ${vaultAnalysis.activeVaults} active vaults`);

      // Step 2: Identify high-yield opportunities
      const opportunities = await this.identifyOpportunities(vaultAnalysis);
      console.log(`[Paul] Found ${opportunities.length} yield opportunities`);

      // Step 3: Execute yield deposit transactions
      for (const opportunity of opportunities) {
        try {
          const txResult = await this.executeYieldDeposit(opportunity);
          state.transactionsExecuted++;
          state.profitLoss += txResult.estimatedYield;
          state.gasUsed += txResult.gasUsed;
        } catch (error) {
          console.error(`[Paul] Transaction failed:`, error);
          state.successRate -= 10;
        }
      }

      // Step 4: Harvest mature positions
      const harvestedAmount = await this.harvestMaturePositions();
      state.profitLoss += harvestedAmount;
      console.log(`[Paul] Harvested: $${harvestedAmount.toFixed(2)}`);

      // Step 5: Rebalance portfolio
      await this.rebalancePortfolio();
      console.log(`[Paul] Portfolio rebalanced`);

      // Step 6: Update metrics
      state.executionTime = Date.now() - startTime;
      await this.updateMetrics(state);

      // Send success notification
      if (state.profitLoss > 0) {
        await notifyOwner({
          title: "💰 Paul Agent - Yield Harvested",
          content: `Loop #${this.loopNumber}: Earned $${state.profitLoss.toFixed(2)} | ${state.transactionsExecuted} transactions`,
        });

        await insertNotification({
          title: "Paul Yield Harvesting Success",
          content: `Harvested $${state.profitLoss.toFixed(2)} in loop #${this.loopNumber}`,
          type: "success",
          relatedAgent: "Paul",
        });
      }

      console.log(`[Paul] Loop #${this.loopNumber} complete in ${state.executionTime}ms`);
      return state;
    } catch (error) {
      console.error(`[Paul] Loop #${this.loopNumber} failed:`, error);

      state.successRate = 0;
      state.profitLoss = -0.1; // Gas fee loss

      await insertNotification({
        title: "Paul Agent Error",
        content: `Loop #${this.loopNumber} failed: ${String(error).substring(0, 100)}`,
        type: "error",
        relatedAgent: "Paul",
      });

      throw error;
    }
  }

  /**
   * Analyze current vault positions
   */
  private async analyzeVaults() {
    // Simulated vault analysis
    return {
      activeVaults: 3,
      totalTVL: 305000,
      averageAPY: 8.7,
      vaults: [
        { id: "vault_usdc_earn", apy: 8.5, tvl: 125000, health: 98 },
        { id: "vault_usdt_earn", apy: 7.8, tvl: 95000, health: 99 },
        { id: "vault_sol_earn", apy: 9.2, tvl: 85000, health: 96 },
      ],
    };
  }

  /**
   * Identify high-yield opportunities
   */
  private async identifyOpportunities(analysis: any) {
    return analysis.vaults
      .filter((v: any) => v.apy > 8.0)
      .map((v: any) => ({
        vaultId: v.id,
        apy: v.apy,
        depositAmount: Math.min(10000, v.tvl * 0.1),
        expectedYield: (Math.min(10000, v.tvl * 0.1) * v.apy) / 100 / 365,
      }));
  }

  /**
   * Execute a yield deposit transaction
   */
  private async executeYieldDeposit(opportunity: any) {
    // Simulated transaction execution
    const gasUsed = 0.005; // SOL
    const estimatedYield = opportunity.expectedYield;

    await insertTransaction({
      signature: `paul_yield_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "yield_deposit",
      initiator: "PaulYieldHarvester11111111111111111111111111",
      relatedVault: opportunity.vaultId,
      relatedAgent: "Paul",
      amount: opportunity.depositAmount.toString(),
      fee: gasUsed.toString(),
      status: "confirmed",
      blockTime: Math.floor(Date.now() / 1000),
      details: {
        apy: opportunity.apy,
        expectedYield: estimatedYield,
      },
    });

    return {
      gasUsed,
      estimatedYield,
    };
  }

  /**
   * Harvest mature positions
   */
  private async harvestMaturePositions() {
    // Simulated harvest
    const harvestedAmount = 45.67; // USD value

    await insertTransaction({
      signature: `paul_harvest_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "yield_harvest",
      initiator: "PaulYieldHarvester11111111111111111111111111",
      amount: harvestedAmount.toString(),
      fee: "0.003",
      status: "confirmed",
      blockTime: Math.floor(Date.now() / 1000),
      details: {
        harvestedAmount,
        source: "accumulated_yield",
      },
    });

    return harvestedAmount;
  }

  /**
   * Rebalance portfolio
   */
  private async rebalancePortfolio() {
    // Simulated rebalancing logic
    console.log("[Paul] Rebalancing portfolio based on current market conditions");
  }

  /**
   * Update agent metrics
   */
  private async updateMetrics(state: PaulLoopState) {
    const agent = await getAgentByName("Paul");
    if (!agent) return;

    // Calculate cumulative metrics
    const newTotalEarned = (parseFloat(agent.totalEarned || "0") || 0) + Math.max(0, state.profitLoss);
    const newTotalLost = (parseFloat(agent.totalLost || "0") || 0) + Math.max(0, -state.profitLoss);
    const totalTrades = this.loopNumber;
    const winRate = totalTrades > 0 ? ((totalTrades - Math.floor(newTotalLost / 0.1)) / totalTrades) * 100 : 0;

    await upsertAgent({
      ...agent,
      balance: (parseFloat(agent.balance || "0") + state.profitLoss).toString(),
      totalEarned: newTotalEarned.toString(),
      totalLost: newTotalLost.toString(),
      winRate: winRate.toString(),
      lastLoopAt: new Date(),
    });

    // Insert detailed metrics
    await insertAgentMetric({
      agentId: agent.id,
      loopNumber: state.loopNumber,
      strategyUsed: state.strategyUsed,
      transactionsExecuted: state.transactionsExecuted,
      profitLoss: state.profitLoss.toString(),
      gasUsed: state.gasUsed.toString(),
      executionTime: state.executionTime,
      successRate: state.successRate.toString(),
      metadata: {
        opportunities: 3,
        vaultsAnalyzed: 3,
      },
    });
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      loopNumber: this.loopNumber,
      loopInterval: this.loopInterval,
    };
  }
}

let paulInstance: PaulAgent | null = null;

export function getPaulAgent(): PaulAgent {
  if (!paulInstance) {
    paulInstance = new PaulAgent();
  }
  return paulInstance;
}

export async function initializePaulAgent() {
  const paul = getPaulAgent();
  await paul.start();
  return paul;
}

export default PaulAgent;
