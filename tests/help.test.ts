import { describe, expect, test, beforeEach, mock } from "bun:test";
import { showHelp } from "../src/commands/help";

describe("help", () => {
  let output: string[];

  beforeEach(() => {
    output = [];
    mock.module("chalk", () => {
      const identity = (s: string) => s;
      const handler: ProxyHandler<object> = {
        get: () => new Proxy(identity, handler),
        apply: (_target, _thisArg, args) => args[0],
      };
      return { default: new Proxy(identity, handler) };
    });
    console.log = (...args: unknown[]) => output.push(args.join(" "));
  });

  test("shows command categories", () => {
    showHelp();
    const text = output.join("\n");
    expect(text).toContain("System");
    expect(text).toContain("Apps");
    expect(text).toContain("Media");
    expect(text).toContain("General");
  });

  test("shows all commands", () => {
    showHelp();
    const text = output.join("\n");
    expect(text).toContain("system");
    expect(text).toContain("spotify");
    expect(text).toContain("whisky");
    expect(text).toContain("yt");
    expect(text).toContain("yt-mp3");
    expect(text).toContain("harmonica");
    expect(text).toContain("help");
    expect(text).toContain("clear");
    expect(text).toContain("exit");
  });
});
