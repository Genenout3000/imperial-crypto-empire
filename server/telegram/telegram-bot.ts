import { getMultiChainAgentLoop } from "../agents/multichain-agent-loop";
import { getSelfLearningEngine } from "../agents/self-learning-engine";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface TelegramMessage {
  chat_id: number;
  text: string;
  parse_mode?: string;
}

/**
 * Telegram Bot Integration for Agent Control & Notifications
 * Allows real-time agent management and status updates via Telegram
 */
export class TelegramAgentBot {
  private agentLoop: typeof getMultiChainAgentLoop;
  private chatIds: Set<number> = new Set();

  constructor() {
    this.agentLoop = getMultiChainAgentLoop;
  }

  /**
   * Initialize Telegram bot
   */
  async initialize(): Promise<void> {
    console.log("[TelegramBot] Initializing...");

    try {
      // Verify bot token
      const response = await fetch(`${TELEGRAM_API_URL}/getMe`);
      const data = await response.json();

      if (data.ok) {
        console.log(`[TelegramBot] ✅ Connected as @${data.result.username}`);
        console.log(`[TelegramBot] Bot ID: ${data.result.id}`);
      } else {
        console.error("[TelegramBot] Failed to initialize:", data.description);
      }
    } catch (error) {
      console.error("[TelegramBot] Initialization error:", error);
    }
  }

  /**
   * Handle incoming Telegram message
   */
  async handleMessage(message: any): Promise<void> {
    const chatId = message.chat.id;
    const text = message.text || "";
    const userId = message.from.id;

    // Store chat ID for notifications
    this.chatIds.add(chatId);

    console.log(`[TelegramBot] Message from ${message.from.first_name}: ${text}`);

    // Parse commands
    if (text.startsWith("/")) {
      await this.handleCommand(chatId, text, userId);
    } else {
      await this.handleQuery(chatId, text);
    }
  }

  /**
   * Handle Telegram commands
   */
  private async handleCommand(chatId: number, command: string, userId: number): Promise<void> {
    const args = command.split(" ");
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case "/start":
        await this.sendMessage(chatId, "🤖 Welcome to Imperial Crypto Empire Agent Control!\n\nAvailable commands:\n/status - Agent status\n/paul - Paul agent info\n/ralph - Ralph agent info\n/guardian - Guardian agent info\n/start_agents - Start all agents\n/stop_agents - Stop all agents\n/performance - Performance metrics\n/help - Show help");
        break;

      case "/status":
        await this.sendAgentStatus(chatId);
        break;

      case "/paul":
        await this.sendPaulStatus(chatId);
        break;

      case "/ralph":
        await this.sendRalphStatus(chatId);
        break;

      case "/guardian":
        await this.sendGuardianStatus(chatId);
        break;

      case "/start_agents":
        await this.startAgents(chatId);
        break;

      case "/stop_agents":
        await this.stopAgents(chatId);
        break;

      case "/performance":
        await this.sendPerformanceMetrics(chatId);
        break;

      case "/help":
        await this.sendMessage(
          chatId,
          "📖 *Imperial Crypto Empire - Agent Commands*\n\n" +
            "/status - Get real-time agent status\n" +
            "/paul - Paul (Yield Harvesting) agent details\n" +
            "/ralph - Ralph (Liquidity Sniping) agent details\n" +
            "/guardian - Guardian (Monitoring) agent details\n" +
            "/start_agents - Start autonomous agent loop\n" +
            "/stop_agents - Stop autonomous agent loop\n" +
            "/performance - View performance metrics\n" +
            "/help - Show this help message"
        );
        break;

      default:
        await this.sendMessage(chatId, "❌ Unknown command. Type /help for available commands.");
    }
  }

  /**
   * Handle natural language queries
   */
  private async handleQuery(chatId: number, query: string): Promise<void> {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("status")) {
      await this.sendAgentStatus(chatId);
    } else if (lowerQuery.includes("paul")) {
      await this.sendPaulStatus(chatId);
    } else if (lowerQuery.includes("ralph")) {
      await this.sendRalphStatus(chatId);
    } else if (lowerQuery.includes("guardian")) {
      await this.sendGuardianStatus(chatId);
    } else if (lowerQuery.includes("start")) {
      await this.startAgents(chatId);
    } else if (lowerQuery.includes("stop")) {
      await this.stopAgents(chatId);
    } else if (lowerQuery.includes("performance")) {
      await this.sendPerformanceMetrics(chatId);
    } else {
      await this.sendMessage(chatId, "I didn't understand that. Try /help for available commands.");
    }
  }

  /**
   * Send agent status
   */
  private async sendAgentStatus(chatId: number): Promise<void> {
    const loop = this.agentLoop();
    const status = loop.getStatus();

    const message =
      `🤖 *Agent Status*\n\n` +
      `Status: ${status.running ? "🟢 RUNNING" : "🔴 STOPPED"}\n\n` +
      `Agents:\n` +
      status.agents.map((a) => `• ${a.name} (${a.type}): ${a.status}`).join("\n");

    await this.sendMessage(chatId, message);
  }

  /**
   * Send Paul agent status
   */
  private async sendPaulStatus(chatId: number): Promise<void> {
    const engine = getSelfLearningEngine("paul-yield-agent", "Paul");
    const metrics = engine.getPerformanceMetrics();
    const history = engine.getDecisionHistory(3);

    const message =
      `🌾 *Paul - Yield Harvesting Agent*\n\n` +
      `Performance:\n` +
      `• Total Decisions: ${metrics.totalDecisions}\n` +
      `• Success Rate: ${metrics.successRate}%\n` +
      `• Average Return: ${metrics.averageReturn}%\n` +
      `• Lessons Learned: ${metrics.lessonsLearned}\n` +
      `• Adaptations: ${metrics.adaptationsMade}\n\n` +
      `Recent Decisions:\n` +
      history.map((d) => `• ${d.action} (${(d.confidence * 100).toFixed(0)}% confidence)`).join("\n");

    await this.sendMessage(chatId, message);
  }

  /**
   * Send Ralph agent status
   */
  private async sendRalphStatus(chatId: number): Promise<void> {
    const engine = getSelfLearningEngine("ralph-liquidity-agent", "Ralph");
    const metrics = engine.getPerformanceMetrics();
    const history = engine.getDecisionHistory(3);

    const message =
      `⚡ *Ralph - Liquidity Sniping Agent*\n\n` +
      `Performance:\n` +
      `• Total Decisions: ${metrics.totalDecisions}\n` +
      `• Success Rate: ${metrics.successRate}%\n` +
      `• Average Return: ${metrics.averageReturn}%\n` +
      `• Lessons Learned: ${metrics.lessonsLearned}\n` +
      `• Adaptations: ${metrics.adaptationsMade}\n\n` +
      `Recent Decisions:\n` +
      history.map((d) => `• ${d.action} (${(d.confidence * 100).toFixed(0)}% confidence)`).join("\n");

    await this.sendMessage(chatId, message);
  }

  /**
   * Send Guardian agent status
   */
  private async sendGuardianStatus(chatId: number): Promise<void> {
    const engine = getSelfLearningEngine("guardian-monitor-agent", "Guardian");
    const metrics = engine.getPerformanceMetrics();

    const message =
      `🛡️ *Guardian - System Monitoring Agent*\n\n` +
      `Performance:\n` +
      `• Total Decisions: ${metrics.totalDecisions}\n` +
      `• Success Rate: ${metrics.successRate}%\n` +
      `• Lessons Learned: ${metrics.lessonsLearned}\n` +
      `• Adaptations: ${metrics.adaptationsMade}\n\n` +
      `Status: 🟢 All systems nominal`;

    await this.sendMessage(chatId, message);
  }

  /**
   * Start agents
   */
  private async startAgents(chatId: number): Promise<void> {
    const loop = this.agentLoop();
    await loop.start();
    await this.sendMessage(chatId, "✅ All agents started! 24/7 autonomous execution enabled.");
    await this.notifyAllChats("🚀 Agent loop started by user");
  }

  /**
   * Stop agents
   */
  private async stopAgents(chatId: number): Promise<void> {
    const loop = this.agentLoop();
    await loop.stop();
    await this.sendMessage(chatId, "⏹️ All agents stopped.");
    await this.notifyAllChats("⏹️ Agent loop stopped by user");
  }

  /**
   * Send performance metrics
   */
  private async sendPerformanceMetrics(chatId: number): Promise<void> {
    const paulEngine = getSelfLearningEngine("paul-yield-agent", "Paul");
    const ralphEngine = getSelfLearningEngine("ralph-liquidity-agent", "Ralph");
    const guardianEngine = getSelfLearningEngine("guardian-monitor-agent", "Guardian");

    const paulMetrics = paulEngine.getPerformanceMetrics();
    const ralphMetrics = ralphEngine.getPerformanceMetrics();
    const guardianMetrics = guardianEngine.getPerformanceMetrics();

    const message =
      `📊 *Performance Metrics*\n\n` +
      `*Paul (Yield Harvesting)*\n` +
      `Success Rate: ${paulMetrics.successRate}%\n` +
      `Average Return: ${paulMetrics.averageReturn}%\n\n` +
      `*Ralph (Liquidity Sniping)*\n` +
      `Success Rate: ${ralphMetrics.successRate}%\n` +
      `Average Return: ${ralphMetrics.averageReturn}%\n\n` +
      `*Guardian (Monitoring)*\n` +
      `Success Rate: ${guardianMetrics.successRate}%\n\n` +
      `Total Decisions: ${paulMetrics.totalDecisions + ralphMetrics.totalDecisions + guardianMetrics.totalDecisions}`;

    await this.sendMessage(chatId, message);
  }

  /**
   * Send message to Telegram
   */
  private async sendMessage(chatId: number, text: string): Promise<void> {
    try {
      const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: "Markdown",
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        console.error("[TelegramBot] Failed to send message:", data.description);
      }
    } catch (error) {
      console.error("[TelegramBot] Error sending message:", error);
    }
  }

  /**
   * Notify all connected chats
   */
  private async notifyAllChats(message: string): Promise<void> {
    this.chatIds.forEach(async (chatId) => {
      await this.sendMessage(chatId, message);
    });
  }

  /**
   * Send critical alert
   */
  async sendCriticalAlert(message: string): Promise<void> {
    const alertMessage = `🚨 *CRITICAL ALERT*\n\n${message}`;
    await this.notifyAllChats(alertMessage);
  }

  /**
   * Send agent decision notification
   */
  async notifyAgentDecision(agentName: string, action: string, confidence: number, reasoning: string): Promise<void> {
    const message = `🤖 *${agentName} Decision*\n\nAction: ${action}\nConfidence: ${(confidence * 100).toFixed(0)}%\nReasoning: ${reasoning}`;
    await this.notifyAllChats(message);
  }
}

// Singleton instance
let botInstance: TelegramAgentBot | null = null;

export function getTelegramBot(): TelegramAgentBot {
  if (!botInstance) {
    botInstance = new TelegramAgentBot();
  }
  return botInstance;
}
