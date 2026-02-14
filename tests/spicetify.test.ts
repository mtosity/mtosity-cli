import { describe, expect, test, beforeEach, mock } from "bun:test";
import { runSpicetify } from "../src/commands/spicetify";

describe("spicetify", () => {
  let output: string[];
  const originalLog = console.log;

  beforeEach(() => {
    output = [];
    console.log = (...args: unknown[]) => output.push(args.join(" "));
  });

  test("shows usage when no subcommand given", async () => {
    await runSpicetify();
    const text = output.join("\n");
    expect(text).toContain("Usage: spotify <action>");
    expect(text).toContain("status");
    expect(text).toContain("theme");
    expect(text).toContain("apply");
    expect(text).toContain("restart");
    expect(text).toContain("fix");
    expect(text).toContain("restore");
  });

  test("shows theme usage when no theme name given", async () => {
    await runSpicetify("theme");
    const text = output.join("\n");
    expect(text).toContain("Usage: spotify theme <name>");
    expect(text).toContain("mocha");
    expect(text).toContain("dracula");
    expect(text).toContain("default");
  });
});
