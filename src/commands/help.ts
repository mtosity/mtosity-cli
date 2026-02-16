import chalk from "chalk";

export function showHelp() {
  const dim = chalk.dim;
  const cmd = chalk.cyan.bold;
  const arg = chalk.yellow;

  console.log("");
  console.log(chalk.green.bold("  MTosity CLI"));
  console.log(dim("  " + "─".repeat(50)));
  console.log("");

  console.log(chalk.white.bold("  About"));
  console.log(`    ${cmd("me")}                          Animated resume / about me`);
  console.log("");

  console.log(chalk.white.bold("  System"));
  console.log(`    ${cmd("system")}                      Show system info`);
  console.log("");

  console.log(chalk.white.bold("  Apps"));
  console.log(`    ${cmd("spotify")} ${arg("<action>")}             Manage Spicetify`);
  console.log(dim("      actions: status, theme <name>, apply, restart, fix, restore"));
  console.log(`    ${cmd("whisky")} ${arg("<action>")}              Run Windows apps via Whisky`);
  console.log(dim("      actions: status, run <file.exe>, open, install"));
  console.log("");

  console.log(chalk.white.bold("  Media"));
  console.log(`    ${cmd("yt")} ${arg("<url>")} ${dim("[start] [end]")}        Download YouTube video`);
  console.log(`    ${cmd("yt-mp3")} ${arg("<url>")} ${dim("[start] [end]")}    Download YouTube audio`);
  console.log(`    ${cmd("harmonica")} ${arg("<file>")} ${dim("[preset]")}     Enhance harmonica recording`);
  console.log(dim("      presets: echo (default), echo-light, echo-heavy, bass"));
  console.log("");

  console.log(chalk.white.bold("  Games"));
  console.log(`    ${cmd("game")} ${arg("<name>")}                 Play a terminal game`);
  console.log(dim("      games: tetris (Bastard Tetris), invaders (Space Invaders)"));
  console.log("");

  console.log(chalk.white.bold("  Utility"));
  console.log(`    ${cmd("weather")} ${dim("[city] [--date YYYY-MM-DD]")}    Show weather (use --date for specific day)`);
  console.log(`    ${cmd("clock")} ${dim("[-p <city>]...")}              World clock (use -p to add cities)`);
  console.log("");

  console.log(chalk.white.bold("  General"));
  console.log(`    ${cmd("help")}                        Show this help`);
  console.log(`    ${cmd("clear")}                       Clear the screen`);
  console.log(`    ${cmd("exit")}                        Quit the CLI`);
  console.log("");
}
