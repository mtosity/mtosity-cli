import { describe, expect, test, beforeEach, mock, spyOn } from "bun:test";
import * as childProcess from "child_process";

// Mock execSync so whisky appears installed and brew isn't called
spyOn(childProcess, "execSync").mockImplementation(((cmd: string) => {
  const command = String(cmd);
  if (command.includes("which whisky")) return "/opt/homebrew/bin/whisky\n";
  if (command.includes("brew install")) throw new Error("should not install in tests");
  return "";
}) as typeof childProcess.execSync);

// Import after mocking
const { runWhisky } = await import("../src/commands/whisky");

describe("whisky", () => {
  let output: string[];

  beforeEach(() => {
    output = [];
    console.log = (...args: unknown[]) => output.push(args.join(" "));
  });

  test("shows usage when no subcommand given", async () => {
    await runWhisky();
    const text = output.join("\n");
    expect(text).toContain("Usage: whisky <action>");
    expect(text).toContain("status");
    expect(text).toContain("run");
    expect(text).toContain("open");
    expect(text).toContain("install");
  });

  test("shows run usage when no file given", async () => {
    await runWhisky("run");
    const text = output.join("\n");
    expect(text).toContain("Usage: whisky run");
  });

  test("shows error for nonexistent file", async () => {
    await runWhisky("run", "/tmp/nonexistent_test_file_12345.exe");
    const text = output.join("\n");
    expect(text).toContain("File not found");
  });

  test("shows error for unknown action", async () => {
    await runWhisky("foobar");
    const text = output.join("\n");
    expect(text).toContain("Unknown action: foobar");
  });
});
