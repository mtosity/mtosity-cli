import chalk from "chalk";
import figlet from "figlet";
import readline from "readline";
import { runNeofetch } from "./commands/system";
import { downloadYouTube } from "./commands/youtube";
import { showHelp } from "./commands/help";
import { enhanceHarmonica } from "./commands/harmonica";
import { runSpicetify } from "./commands/spicetify";
import { runWhisky } from "./commands/whisky";
import { showResume } from "./commands/me";
import { showClock, parsePlaces } from "./commands/clock";
import { runGame } from "./commands/game";
import { showWeather } from "./commands/weather";

function prompt(rl: readline.Interface): Promise<string> {
  return new Promise((resolve) => {
    rl.question(chalk.green("mtosity > "), (answer) => {
      resolve(answer);
    });
  });
}

export async function main() {
  console.clear();
  console.log(
    chalk.green(figlet.textSync("MTosity", { horizontalLayout: "full" }))
  );
  console.log(chalk.dim(`Welcome! Type '${chalk.white("me")}' to learn about me, or '${chalk.white("help")}' for all commands.\n`));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    historySize: 100,
    terminal: true,
  });

  // Handle Ctrl+C gracefully
  rl.on("close", () => {
    const confirmRl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    console.log("");
    confirmRl.question(
      chalk.yellow("Are you sure you want to quit? (y/N) "),
      (answer) => {
        confirmRl.close();
        if (answer.trim().toLowerCase() === "y") {
          console.log(chalk.green("Goodbye!"));
          process.exit(0);
        } else {
          main().catch(console.error);
        }
      }
    );
  });

  // Prevent default SIGINT from killing the process
  process.on("SIGINT", () => {});

  while (true) {
    const input = await prompt(rl);

    const parts = input.trim().split(" ");
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case "system":
        await runNeofetch();
        break;

      case "yt":
        if (!args[0]) {
          console.log(chalk.dim("Usage: yt <url> [start] [end]"));
        } else {
          await downloadYouTube(args[0], "video", args[1], args[2]);
        }
        break;

      case "yt-mp3":
        if (!args[0]) {
          console.log(chalk.dim("Usage: yt-mp3 <url> [start] [end]"));
        } else {
          await downloadYouTube(args[0], "audio", args[1], args[2]);
        }
        break;

      case "spotify":
        await runSpicetify(args[0], args[1]);
        break;

      case "whisky":
        await runWhisky(args[0], args[1]);
        break;

      case "harmonica":
        await enhanceHarmonica(args[0], args[1]);
        break;

      case "me":
        await showResume();
        break;

      case "clock":
        const extraPlaces = parsePlaces(args);
        showClock(extraPlaces);
        break;

      case "game":
        await runGame(rl, args[0]);
        break;

      case "weather":
        await showWeather(args);
        break;

      case "clear":
        console.clear();
        break;

      case "exit":
        console.log(chalk.green("Goodbye!"));
        rl.close();
        process.exit(0);

      case "":
        break;

      case "help":
        showHelp();
        break;

      default:
        console.log(chalk.red(`Unknown command: ${cmd}`));
        break;
    }
  }
}
