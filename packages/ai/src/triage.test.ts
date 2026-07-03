import { describe, expect, it } from "vitest";
import { keywordTriage, triageWithFallback } from "./triage";

describe("keywordTriage", () => {
  it("classifies emergency keywords as emergency", () => {
    const result = keywordTriage({ message: "I lost my passport at Lisbon airport" });
    expect(result.tier).toBe("emergency");
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it("classifies medical distress as emergency", () => {
    const result = keywordTriage({ message: "My partner is in the hospital" });
    expect(result.tier).toBe("emergency");
  });

  it("classifies simple questions as informational", () => {
    const result = keywordTriage({ message: "What time does the restaurant open?" });
    expect(result.tier).toBe("informational");
  });

  it("classifies ambiguous messages as logistical (safe default)", () => {
    const result = keywordTriage({ message: "The transfer was late" });
    expect(result.tier).toBe("logistical");
  });

  it("handles empty input gracefully", () => {
    const result = keywordTriage({ message: "" });
    expect(result.tier).toMatch(/^informational$|^logistical$|^emergency$/);
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});

describe("triageWithFallback", () => {
  it("uses keywordTriage when USE_LLM is not set", async () => {
    const original = process.env.USE_LLM;
    delete process.env.USE_LLM;
    const result = await triageWithFallback({ message: "Where is the nearest pharmacy?" });
    expect(result.tier).toBe("informational");
    if (original) process.env.USE_LLM = original;
  });

  it("uses keywordTriage when OPENAI_API_KEY is missing", async () => {
    const originalUse = process.env.USE_LLM;
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.USE_LLM = "true";
    delete process.env.OPENAI_API_KEY;
    const result = await triageWithFallback({ message: "Where is the nearest pharmacy?" });
    expect(result.tier).toBe("informational");
    if (originalUse) process.env.USE_LLM = originalUse;
    if (originalKey) process.env.OPENAI_API_KEY = originalKey;
  });
});
