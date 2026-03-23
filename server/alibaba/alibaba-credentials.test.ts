import { describe, it, expect } from "vitest";
import { ENV } from "../_core/env";

describe("Alibaba Cloud Credentials", () => {
  it("should have DashScope API key configured", () => {
    expect(ENV.alibabaDashscopeApiKey).toBeDefined();
    expect(typeof ENV.alibabaDashscopeApiKey).toBe("string");
    expect(ENV.alibabaDashscopeApiKey.length).toBeGreaterThan(0);
    // DashScope keys typically start with 'cfk_'
    expect(ENV.alibabaDashscopeApiKey).toMatch(/^cfk_/);
  });

  it("should have Access Key ID configured", () => {
    expect(ENV.alibabaAccessKeyId).toBeDefined();
    expect(typeof ENV.alibabaAccessKeyId).toBe("string");
    expect(ENV.alibabaAccessKeyId.length).toBeGreaterThan(0);
    // Alibaba Access Key IDs typically start with 'LTAI'
    expect(ENV.alibabaAccessKeyId).toMatch(/^LTAI/);
  });

  it("should have Access Key Secret configured", () => {
    expect(ENV.alibabaAccessKeySecret).toBeDefined();
    expect(typeof ENV.alibabaAccessKeySecret).toBe("string");
    expect(ENV.alibabaAccessKeySecret.length).toBeGreaterThan(0);
  });

  it("should have all Alibaba credentials present", () => {
    const credentials = {
      dashscopeApiKey: ENV.alibabaDashscopeApiKey,
      accessKeyId: ENV.alibabaAccessKeyId,
      accessKeySecret: ENV.alibabaAccessKeySecret,
    };

    Object.entries(credentials).forEach(([key, value]) => {
      expect(value, `Missing credential: ${key}`).toBeDefined();
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    });
  });

  it("should validate credential format", () => {
    // DashScope API key format: cfk_ followed by alphanumeric
    expect(ENV.alibabaDashscopeApiKey).toMatch(/^cfk_[a-zA-Z0-9]+$/);

    // Access Key ID format: LTAI followed by alphanumeric
    expect(ENV.alibabaAccessKeyId).toMatch(/^LTAI[a-zA-Z0-9]+$/);

    // Access Key Secret format (typically 30+ characters)
    expect(ENV.alibabaAccessKeySecret.length).toBeGreaterThanOrEqual(30);
  });
});
