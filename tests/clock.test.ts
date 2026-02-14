import { describe, expect, test, beforeEach, mock } from "bun:test";
import { showClock, parsePlaces } from "../src/commands/clock";

describe("clock", () => {
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

  test("shows world clock header", () => {
    showClock();
    const text = output.join("\n");
    expect(text).toContain("World Clock");
  });

  test("shows expected cities", () => {
    showClock();
    const text = output.join("\n");
    expect(text).toContain("Tokyo");
    expect(text).toContain("Ho Chi Minh");
    expect(text).toContain("London");
    expect(text).toContain("New York");
    expect(text).toContain("San Francisco");
    expect(text).toContain("Sydney");
  });

  test("shows grouping labels", () => {
    showClock();
    const text = output.join("\n");
    // At least one of ahead/behind/same should appear
    const hasGrouping =
      text.includes("Ahead") || text.includes("Behind") || text.includes("Same");
    expect(hasGrouping).toBe(true);
  });

  test("shows local timezone info", () => {
    showClock();
    const text = output.join("\n");
    expect(text).toContain("Timezone:");
  });

  test("parses -p flags correctly", () => {
    const args = ["-p", "berlin", "-p", "san", "francisco"];
    const places = parsePlaces(args);
    expect(places).toContain("berlin");
    expect(places).toContain("san francisco");
  });

  test("shows extra cities when requested", () => {
    showClock(["berlin", "ha noi"]);
    const text = output.join("\n");
    expect(text).toContain("Berlin");
    expect(text).toContain("🇩🇪");
    expect(text).toContain("Ha Noi");
    expect(text).toContain("🇻🇳");
  });

  test("handles unknown cities gracefully", () => {
    showClock(["Atlantis"]);
    const text = output.join("\n");
    expect(text).toContain("Unknown place");
    expect(text).toContain("Atlantis");
  });
});
