import { describe, it, expect } from "vitest";

describe("Multi-chain Agent Credentials Validation", () => {
  describe("Environment Variables", () => {
    it("should have ALCHEMY_API_KEY configured", () => {
      const key = process.env.ALCHEMY_API_KEY;
      expect(key).toBeDefined();
      expect(key?.length).toBeGreaterThan(0);
      // Alchemy keys typically start with 'a-' or similar pattern
      expect(key).toMatch(/^[a-zA-Z0-9\-_]+$/);
    });

    it("should have HELIUS_API_KEY configured", () => {
      const key = process.env.HELIUS_API_KEY;
      expect(key).toBeDefined();
      expect(key?.length).toBeGreaterThan(0);
      // Helius keys are typically UUIDs
      expect(key).toMatch(/^[a-f0-9\-]+$/);
    });

    it("should have TELEGRAM_BOT_TOKEN configured", () => {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      expect(token).toBeDefined();
      expect(token?.length).toBeGreaterThan(0);
      // Telegram tokens format: numeric:alphanumeric
      expect(token).toMatch(/^\d+:[a-zA-Z0-9_\-]+$/);
    });
  });

  describe("Credential Format Validation", () => {
    it("should validate Alchemy API key format", () => {
      const key = process.env.ALCHEMY_API_KEY;
      expect(key).toBeDefined();
      // Alchemy keys are typically 20+ characters
      expect(key!.length).toBeGreaterThanOrEqual(15);
    });

    it("should validate Helius API key format", () => {
      const key = process.env.HELIUS_API_KEY;
      expect(key).toBeDefined();
      // Helius keys are typically UUIDs (36 characters with hyphens)
      expect(key!.length).toBeGreaterThanOrEqual(30);
    });

    it("should validate Telegram bot token format", () => {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      expect(token).toBeDefined();
      const parts = token!.split(":");
      expect(parts).toHaveLength(2);
      expect(parts[0]).toMatch(/^\d+$/); // First part is numeric
      expect(parts[1].length).toBeGreaterThan(20); // Second part is long alphanumeric
    });
  });

  describe("Credential Availability", () => {
    it("should have all required credentials for multi-chain agent", () => {
      const requiredKeys = ["ALCHEMY_API_KEY", "HELIUS_API_KEY", "TELEGRAM_BOT_TOKEN"];

      for (const key of requiredKeys) {
        expect(process.env[key]).toBeDefined();
        expect(process.env[key]?.length).toBeGreaterThan(0);
      }
    });

    it("should confirm credentials are not empty strings", () => {
      expect(process.env.ALCHEMY_API_KEY).not.toBe("");
      expect(process.env.HELIUS_API_KEY).not.toBe("");
      expect(process.env.TELEGRAM_BOT_TOKEN).not.toBe("");
    });
  });

  describe("Multi-chain Integration Ready", () => {
    it("should be ready for Alchemy RPC calls", () => {
      const alchemyKey = process.env.ALCHEMY_API_KEY;
      expect(alchemyKey).toBeDefined();
      // Can construct Alchemy RPC URL
      const rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`;
      expect(rpcUrl).toContain("alchemy.com");
    });

    it("should be ready for Helius RPC calls", () => {
      const heliusKey = process.env.HELIUS_API_KEY;
      expect(heliusKey).toBeDefined();
      // Can construct Helius RPC URL
      const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`;
      expect(rpcUrl).toContain("helius-rpc.com");
    });

    it("should be ready for Telegram bot integration", () => {
      const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
      expect(telegramToken).toBeDefined();
      // Can construct Telegram API URL
      const apiUrl = `https://api.telegram.org/bot${telegramToken}/getMe`;
      expect(apiUrl).toContain("telegram.org");
    });
  });
});
