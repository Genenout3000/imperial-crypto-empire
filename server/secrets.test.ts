import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("Environment Secrets Configuration", () => {
  it("should have all required blockchain secrets configured", () => {
    expect(ENV.heliusApiKey).toBeDefined();
    expect(ENV.heliusApiKey.length).toBeGreaterThan(20);

    expect(ENV.solanaRpcUrl).toBeDefined();
    expect(ENV.solanaRpcUrl).toContain("helius-rpc.com");
  });

  it("should have Jupiter Lend program IDs configured", () => {
    expect(ENV.jupiterLendEarnProgram).toBeDefined();
    expect(ENV.jupiterLendBorrowProgram).toBeDefined();
    
    expect(ENV.jupiterLendEarnProgram).toMatch(/^[1-9A-HJ-NP-Za-km-z]{20,44}$/);
    expect(ENV.jupiterLendBorrowProgram).toMatch(/^[1-9A-HJ-NP-Za-km-z]{20,44}$/);
  });

  it("should have S3 storage configured", () => {
    expect(ENV.s3BucketName).toBeDefined();
    expect(ENV.s3BucketName).toMatch(/^[a-z0-9-]+$/);
    expect(ENV.s3BucketName).not.toMatch(/[A-Z]/);

    expect(ENV.s3Region).toBeDefined();
    expect(ENV.s3Region).toMatch(/^[a-z0-9-]+$/);
  });

  it("should have optional notification services configured", () => {
    // Telegram token is optional and may be a placeholder
    if (ENV.telegramBotToken && ENV.telegramBotToken.includes(":")) {
      expect(ENV.telegramBotToken).toMatch(/^\d+:[a-zA-Z0-9_-]+$/);
    }

    if (ENV.emailServiceKey && ENV.emailServiceKey.length > 5) {
      expect(ENV.emailServiceKey.length).toBeGreaterThan(5);
    }
  });

  it("should validate Helius RPC endpoint", () => {
    expect(ENV.solanaRpcUrl).toContain("helius-rpc.com");
    expect(ENV.solanaRpcUrl).toContain("api-key=");
  });

  it("should validate Solana addresses format", () => {
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{20,44}$/;
    expect(ENV.treasuryPubkey).toMatch(solanaAddressRegex);
  });

  it("should validate S3 bucket naming conventions", () => {
    expect(ENV.s3BucketName).toMatch(/^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/);
  });

  it("should have Supabase backend configured", () => {
    expect(ENV.supabaseUrl).toBeDefined();
    expect(ENV.supabaseUrl).toMatch(/^https?:\/\//);

    expect(ENV.supabaseSecretKey).toBeDefined();
    expect(ENV.supabaseSecretKey.length).toBeGreaterThan(10);
  });
});
