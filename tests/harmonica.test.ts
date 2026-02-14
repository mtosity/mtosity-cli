import { describe, expect, test, beforeEach } from "bun:test";
import { enhanceHarmonica } from "../src/commands/harmonica";

describe("harmonica", () => {
  let output: string[];

  beforeEach(() => {
    output = [];
    console.log = (...args: unknown[]) => output.push(args.join(" "));
  });

  test("shows usage when no file given", async () => {
    await enhanceHarmonica();
    const text = output.join("\n");
    expect(text).toContain("Usage: harmonica <file>");
    expect(text).toContain("echo");
    expect(text).toContain("bass");
  });
});
