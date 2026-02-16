import chalk from "chalk";
import figlet from "figlet";
import { CommandRegistry, CommandContext } from "./commands/registry";
import { Renderer } from "./ui/renderer";
import { SuggestionEngine } from "./ui/suggestions";
import { InputHandler } from "./ui/input";
import { showHelp } from "./commands/help";
import { runNeofetch } from "./commands/system";
import { downloadYouTube } from "./commands/youtube";
import { enhanceHarmonica } from "./commands/harmonica";
import { runSpicetify } from "./commands/spicetify";
import { runWhisky } from "./commands/whisky";
import { showResume } from "./commands/me";
import { showClock, parsePlaces } from "./commands/clock";
import { runGame } from "./commands/game";
import { showWeather } from "./commands/weather";

function registerAllCommands(registry: CommandRegistry): void {
  registry.register({
    name: "me",
    description: "Animated resume / about me",
    category: "about",
    handler: async () => { await showResume(); },
  });

  registry.register({
    name: "system",
    description: "Show system info",
    category: "system",
    handler: async () => { await runNeofetch(); },
  });

  registry.register({
    name: "spotify",
    description: "Manage Spicetify",
    usage: "/spotify <action>",
    category: "apps",
    args: [
      {
        name: "action",
        description: "Spicetify action",
        options: [
          { name: "status", description: "Show Spicetify status" },
          { name: "theme", description: "Set or show theme" },
          { name: "apply", description: "Apply Spicetify config" },
          { name: "restart", description: "Restart Spotify" },
          { name: "fix", description: "Fix Spicetify issues" },
          { name: "restore", description: "Restore original Spotify" },
        ],
      },
      { name: "argument", description: "Action argument" },
    ],
    handler: async (args) => { await runSpicetify(args[0], args[1]); },
  });

  registry.register({
    name: "whisky",
    description: "Run Windows apps via Whisky",
    usage: "/whisky <action>",
    category: "apps",
    args: [
      {
        name: "action",
        description: "Whisky action",
        options: [
          { name: "status", description: "Show Whisky status" },
          { name: "run", description: "Run a Windows app" },
          { name: "open", description: "Open Whisky" },
          { name: "install", description: "Install Whisky" },
        ],
      },
    ],
    handler: async (args) => { await runWhisky(args[0], args[1]); },
  });

  registry.register({
    name: "yt",
    description: "Download YouTube video",
    usage: "/yt <url> [start] [end]",
    category: "media",
    args: [
      { name: "url", description: "YouTube video URL" },
      { name: "start", description: "Start time (e.g. 0:30)" },
      { name: "end", description: "End time (e.g. 1:45)" },
    ],
    handler: async (args) => {
      if (!args[0]) {
        console.log(chalk.dim("Usage: /yt <url> [start] [end]"));
      } else {
        await downloadYouTube(args[0], "video", args[1], args[2]);
      }
    },
  });

  registry.register({
    name: "yt-mp3",
    description: "Download YouTube audio",
    usage: "/yt-mp3 <url> [start] [end]",
    category: "media",
    args: [
      { name: "url", description: "YouTube video URL" },
      { name: "start", description: "Start time (e.g. 0:30)" },
      { name: "end", description: "End time (e.g. 1:45)" },
    ],
    handler: async (args) => {
      if (!args[0]) {
        console.log(chalk.dim("Usage: /yt-mp3 <url> [start] [end]"));
      } else {
        await downloadYouTube(args[0], "audio", args[1], args[2]);
      }
    },
  });

  registry.register({
    name: "harmonica",
    description: "Enhance harmonica recording",
    usage: "/harmonica <file> [preset]",
    category: "media",
    args: [
      { name: "file", description: "Path to audio file" },
      {
        name: "preset",
        description: "Audio preset",
        options: [
          { name: "echo", description: "Standard echo effect" },
          { name: "echo-light", description: "Light echo effect" },
          { name: "echo-heavy", description: "Heavy echo effect" },
          { name: "bass", description: "Bass boost" },
        ],
      },
    ],
    handler: async (args) => { await enhanceHarmonica(args[0], args[1]); },
  });

  registry.register({
    name: "game",
    description: "Play a terminal game",
    usage: "/game <name>",
    category: "games",
    args: [
      {
        name: "name",
        description: "Game to play",
        options: [
          { name: "tetris", description: "Bastard Tetris" },
          { name: "invaders", description: "Space Invaders clone" },
        ],
      },
    ],
    handler: async (args, context) => { await runGame(args[0], context); },
  });

  registry.register({
    name: "weather",
    description: "Show weather info",
    usage: "/weather [city] [-d date]",
    category: "utility",
    args: [
      { name: "city", description: "City name" },
    ],
    handler: async (args) => { await showWeather(args); },
  });

  registry.register({
    name: "clock",
    description: "World clock",
    usage: "/clock [-p <city>]...",
    category: "utility",
    args: [
      { name: "city", description: "City name" },
    ],
    handler: (args) => {
      const extraPlaces = parsePlaces(args);
      showClock(extraPlaces);
    },
  });

  registry.register({
    name: "help",
    description: "Show this help",
    category: "general",
    handler: () => { showHelp(registry); },
  });

  registry.register({
    name: "clear",
    description: "Clear the screen",
    category: "general",
    handler: () => { console.clear(); },
  });

  registry.register({
    name: "exit",
    description: "Quit the CLI",
    category: "general",
    handler: () => {
      console.log(chalk.green("Goodbye!"));
      process.exit(0);
    },
  });
}

export async function main() {
  // ── Setup ────────────────────────────────────────────────────────

  const registry = new CommandRegistry();
  registerAllCommands(registry);

  const renderer = new Renderer();
  const suggestionEngine = new SuggestionEngine(registry);
  const inputHandler = new InputHandler(renderer, suggestionEngine);

  // ── Banner ───────────────────────────────────────────────────────

  console.clear();
  console.log(
    chalk.green(figlet.textSync("MTosity", { horizontalLayout: "full" }))
  );
  console.log(
    chalk.dim(
      `Welcome! Type '${chalk.white("/me")}' to learn about me, or '${chalk.white("/help")}' for all commands.\n`
    )
  );

  // ── Raw mode ─────────────────────────────────────────────────────

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding("utf8");

  renderer.setupScrollRegion();

  // Prevent SIGINT from killing the process
  process.on("SIGINT", () => {});

  // ── Command context (for games exclusive mode) ───────────────────

  const context: CommandContext = {
    enterExclusiveMode: () => {
      inputHandler.detach();
      renderer.enterExclusive();
    },
    exitExclusiveMode: () => {
      renderer.exitExclusive();
    },
  };

  // ── Main loop ────────────────────────────────────────────────────

  while (true) {
    const input = await inputHandler.readLine();

    // Ctrl+C — quit confirmation
    if (input === "\x03") {
      renderer.prepareForCommand();
      console.log("");
      console.log(chalk.yellow("Are you sure you want to quit? (y/N) "));

      const answer = await new Promise<string>((resolve) => {
        const onData = (data: Buffer) => {
          const s = data.toString().trim().toLowerCase();
          process.stdin.removeListener("data", onData);
          resolve(s);
        };
        process.stdin.on("data", onData);
      });

      if (answer === "y") {
        console.log(chalk.green("Goodbye!"));
        process.exit(0);
      }
      renderer.restoreAfterCommand();
      continue;
    }

    if (input === "") continue;

    // Strip leading / for backward compatibility
    const normalized = input.startsWith("/") ? input.slice(1) : input;
    const parts = normalized.split(" ");
    const cmdName = parts[0];
    const args = parts.slice(1);

    const cmd = registry.resolve(cmdName);
    if (!cmd) {
      renderer.prepareForCommand();
      console.log(chalk.red(`Unknown command: ${cmdName}`));
      renderer.restoreAfterCommand();
      continue;
    }

    renderer.prepareForCommand();
    try {
      await cmd.handler(args, context);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(chalk.red(`Error: ${message}`));
    }
    renderer.restoreAfterCommand();
  }
}
