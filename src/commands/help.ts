import chalk from "chalk";
import { CommandRegistry } from "./registry";

// Extra details shown below certain commands (keyed by command name)
const EXTRA_DETAILS: Record<string, string[]> = {
  spotify: ["actions: status, theme <name>, apply, restart, fix, restore"],
  whisky: ["actions: status, run <file.exe>, open, install"],
  harmonica: ["presets: echo (default), echo-light, echo-heavy, bass"],
  game: ["games: tetris (Bastard Tetris), invaders (Space Invaders)"],
  weather: ["date format: YYYY-MM-DD or MM-DD (current year)"],
  clock: ["use -p to add cities"],
};

export function showHelp(registry?: CommandRegistry): void {
  const dim = chalk.dim;
  const cmd = chalk.cyan.bold;

  console.log("");
  console.log(chalk.green.bold("  MTosity CLI"));
  console.log(dim("  " + "─".repeat(50)));
  console.log("");

  if (!registry) {
    // Fallback for tests or standalone usage
    console.log(`    Type ${cmd("/help")} for commands`);
    console.log("");
    return;
  }

  const groups = registry.getByCategory();

  for (const group of groups) {
    console.log(chalk.white.bold(`  ${group.label}`));

    for (const c of group.commands) {
      const name = `/${c.name}`;
      const usage = c.usage ? c.usage.slice(c.usage.indexOf(" ") + 1) : "";
      const usageStr = usage ? ` ${chalk.yellow(usage.split(" ")[0])}${dim(" " + usage.split(" ").slice(1).join(" "))}` : "";
      const padding = Math.max(1, 28 - name.length - (usage ? usage.length + 1 : 0));

      console.log(`    ${cmd(name)}${usageStr}${" ".repeat(padding)}${c.description}`);

      const details = EXTRA_DETAILS[c.name];
      if (details) {
        for (const d of details) {
          console.log(dim(`      ${d}`));
        }
      }
    }
    console.log("");
  }
}
