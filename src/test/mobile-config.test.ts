import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("RHINO mobile configuration", () => {
  it("targets Android API 36", () => {
    const gradle = readFileSync("android/variables.gradle", "utf8");
    expect(Number(gradle.match(/targetSdkVersion\s*=\s*(\d+)/)?.[1])).toBe(36);
  });
  it("compiles with Android API 36", () => {
    const gradle = readFileSync("android/variables.gradle", "utf8");
    expect(Number(gradle.match(/compileSdkVersion\s*=\s*(\d+)/)?.[1])).toBe(36);
  });
});