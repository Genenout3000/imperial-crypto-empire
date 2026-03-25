import { invokeLLM } from "../_core/llm";

export interface AgentDecision {
  action: string;
  confidence: number;
  reasoning: string;
  timestamp: Date;
  marketContext: string;
  expectedOutcome: string;
  riskLevel: "low" | "medium" | "high";
}

export interface LearningMemory {
  pastDecisions: AgentDecision[];
  successRate: number;
  averageReturn: number;
  lessons: string[];
  adaptations: string[];
}

/**
 * Self-Learning Reasoning Engine powered by Nvidia NemoClaw (via Manus LLM)
 * Enables autonomous agents to learn from past decisions and adapt strategies
 */
export class SelfLearningEngine {
  private agentId: string;
  private agentName: string;
  private memory: LearningMemory;
  private readonly maxMemorySize = 100;

  constructor(agentId: string, agentName: string) {
    this.agentId = agentId;
    this.agentName = agentName;
    this.memory = {
      pastDecisions: [],
      successRate: 0,
      averageReturn: 0,
      lessons: [],
      adaptations: [],
    };
  }

  /**
   * Make an autonomous decision using self-learning reasoning
   */
  async makeDecision(context: {
    marketCondition: string;
    vaultHealth: number;
    agentPerformance: number;
    riskTolerance: number;
    recentTransactions?: any[];
  }): Promise<AgentDecision> {
    const memoryContext = this.buildMemoryContext();

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are ${this.agentName}, an autonomous DeFi agent with self-learning capabilities.

Your role: ${this.getAgentRole()}

Your learning history:
${memoryContext}

Current market context:
- Market Condition: ${context.marketCondition}
- Vault Health: ${context.vaultHealth}%
- Your Performance: ${context.agentPerformance}%
- Risk Tolerance: ${context.riskTolerance}%

Make a decision based on:
1. Your past successes and failures
2. Current market conditions
3. Your learned strategies
4. Risk management principles

Respond with JSON:
{
  "action": "buy|sell|hold|harvest|repay|snipe|monitor",
  "confidence": 0.0-1.0,
  "reasoning": "explanation of decision",
  "expectedOutcome": "what you expect to happen",
  "riskLevel": "low|medium|high"
}`,
        },
        {
          role: "user",
          content: `Based on my learning history and current conditions, what should I do now?`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "agent_decision",
          strict: true,
          schema: {
            type: "object",
            properties: {
              action: { type: "string" },
              confidence: { type: "number" },
              reasoning: { type: "string" },
              expectedOutcome: { type: "string" },
              riskLevel: { type: "string" },
            },
            required: ["action", "confidence", "reasoning", "expectedOutcome", "riskLevel"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    let decision: AgentDecision;

    if (typeof content === "string") {
      const parsed = JSON.parse(content);
      decision = {
        action: parsed.action,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        timestamp: new Date(),
        marketContext: context.marketCondition,
        expectedOutcome: parsed.expectedOutcome,
        riskLevel: parsed.riskLevel,
      };
    } else {
      decision = {
        action: "hold",
        confidence: 0.5,
        reasoning: "Unable to parse LLM response, defaulting to hold",
        timestamp: new Date(),
        marketContext: context.marketCondition,
        expectedOutcome: "Waiting for clearer signals",
        riskLevel: "low",
      };
    }

    this.memory.pastDecisions.push(decision);
    if (this.memory.pastDecisions.length > this.maxMemorySize) {
      this.memory.pastDecisions.shift();
    }

    return decision;
  }

  /**
   * Learn from past outcomes and adapt strategy
   */
  async learnFromOutcome(
    decision: AgentDecision,
    outcome: {
      success: boolean;
      returnPercentage: number;
      actualOutcome: string;
    }
  ): Promise<void> {
    this.memory.successRate = outcome.success ? 1 : 0;
    this.memory.averageReturn = outcome.returnPercentage;

    const lesson = await this.generateLesson(decision, outcome);
    this.memory.lessons.push(lesson);

    const adaptation = await this.generateAdaptation(decision, outcome);
    this.memory.adaptations.push(adaptation);

    if (this.memory.lessons.length > 20) {
      this.memory.lessons.shift();
    }
    if (this.memory.adaptations.length > 20) {
      this.memory.adaptations.shift();
    }
  }

  /**
   * Generate a lesson from an outcome
   */
  private async generateLesson(
    decision: AgentDecision,
    outcome: { success: boolean; returnPercentage: number; actualOutcome: string }
  ): Promise<string> {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a DeFi learning system. Extract a concise lesson (1 sentence) from this decision outcome.`,
        },
        {
          role: "user",
          content: `Decision: ${decision.action} (${decision.reasoning})
Outcome: ${outcome.success ? "Success" : "Failed"} - ${outcome.actualOutcome}
Return: ${outcome.returnPercentage}%

What is the key lesson?`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    return typeof content === "string" ? content : "Unable to extract lesson";
  }

  /**
   * Generate an adaptation based on outcome
   */
  private async generateAdaptation(
    decision: AgentDecision,
    outcome: { success: boolean; returnPercentage: number; actualOutcome: string }
  ): Promise<string> {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a DeFi strategy optimizer. Suggest a specific adaptation (1 sentence) to improve future decisions.`,
        },
        {
          role: "user",
          content: `Decision: ${decision.action} with ${decision.confidence * 100}% confidence
Outcome: ${outcome.success ? "Success" : "Failed"} - ${outcome.actualOutcome}
Return: ${outcome.returnPercentage}%

How should the strategy adapt?`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    return typeof content === "string" ? content : "Unable to generate adaptation";
  }

  /**
   * Build context from learning memory for LLM
   */
  private buildMemoryContext(): string {
    if (this.memory.pastDecisions.length === 0) {
      return "No learning history yet. Starting fresh.";
    }

    const recentDecisions = this.memory.pastDecisions.slice(-5);
    const context = [
      `Recent Decisions (last 5):`,
      ...recentDecisions.map(
        (d) => `- ${d.action} (${(d.confidence * 100).toFixed(0)}% confidence): ${d.reasoning}`
      ),
      ``,
      `Success Rate: ${(this.memory.successRate * 100).toFixed(1)}%`,
      `Average Return: ${this.memory.averageReturn.toFixed(2)}%`,
      ``,
      `Key Lessons:`,
      ...this.memory.lessons.slice(-3).map((l) => `- ${l}`),
      ``,
      `Recent Adaptations:`,
      ...this.memory.adaptations.slice(-3).map((a) => `- ${a}`),
    ];

    return context.join("\n");
  }

  /**
   * Get agent role description
   */
  private getAgentRole(): string {
    switch (this.agentName) {
      case "Paul":
        return "Yield harvesting specialist. Focus on maximizing returns from liquidity pools and lending protocols.";
      case "Ralph":
        return "Liquidity sniping specialist. Focus on identifying and executing profitable token swaps and arbitrage opportunities.";
      case "Guardian":
        return "System monitoring specialist. Focus on vault health, risk management, and emergency protocols.";
      default:
        return "General DeFi agent. Focus on profitable opportunities while managing risk.";
    }
  }

  /**
   * Get current memory state
   */
  getMemory(): LearningMemory {
    return this.memory;
  }

  /**
   * Get decision history
   */
  getDecisionHistory(limit: number = 10): AgentDecision[] {
    return this.memory.pastDecisions.slice(-limit);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      totalDecisions: this.memory.pastDecisions.length,
      successRate: (this.memory.successRate * 100).toFixed(2),
      averageReturn: this.memory.averageReturn.toFixed(4),
      lessonsLearned: this.memory.lessons.length,
      adaptationsMade: this.memory.adaptations.length,
    };
  }
}

/**
 * Create or get self-learning engine for an agent
 */
const engineInstances = new Map<string, SelfLearningEngine>();

export function getSelfLearningEngine(agentId: string, agentName: string): SelfLearningEngine {
  if (!engineInstances.has(agentId)) {
    engineInstances.set(agentId, new SelfLearningEngine(agentId, agentName));
  }
  return engineInstances.get(agentId)!;
}
