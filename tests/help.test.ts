import { describe, expect, test, beforeEach, mock } from "bun:test";
import { showHelp } from "../src/commands/help";
import { CommandRegistry } from "../src/commands/registry";

function createTestRegistry(): CommandRegistry {
  const registry = new CommandRegistry();
  const noop = () => {};

  registry.register({ name: "me", description: "Animated resume", category: "about", handler: noop });
  registry.register({ name: "system", description: "Show system info", category: "system", handler: noop });
  registry.register({ name: "spotify", description: "Manage Spicetify", usage: "/spotify <action>", category: "apps", handler: noop });
  registry.register({ name: "whisky", description: "Run Windows apps", usage: "/whisky <action>", category: "apps", handler: noop });
  registry.register({ name: "yt", description: "Download YouTube video", usage: "/yt <url>", category: "media", handler: noop });
  registry.register({ name: "yt-mp3", description: "Download YouTube audio", usage: "/yt-mp3 <url>", category: "media", handler: noop });
  registry.register({ name: "harmonica", description: "Enhance harmonica", usage: "/harmonica <file>", category: "media", handler: noop });
  registry.register({ name: "game", description: "Play a game", usage: "/game <name>", category: "games", handler: noop });
  registry.register({ name: "weather", description: "Show weather", usage: "/weather [city]", category: "utility", handler: noop });
  registry.register({ name: "clock", description: "World clock", usage: "/clock [-p city]", category: "utility", handler: noop });
  registry.register({ name: "help", description: "Show this help", category: "general", handler: noop });
  registry.register({ name: "clear", description: "Clear the screen", category: "general", handler: noop });
  registry.register({ name: "exit", description: "Quit the CLI", category: "general", handler: noop });

  return registry;
}

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
    showHelp(createTestRegistry());
    const text = output.join("\n");
    expect(text).toContain("About");
    expect(text).toContain("System");
    expect(text).toContain("Apps");
    expect(text).toContain("Media");
    expect(text).toContain("General");
  });

  test("shows all commands", () => {
    showHelp(createTestRegistry());
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
