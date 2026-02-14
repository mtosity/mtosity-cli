import chalk from "chalk";
import ora from "ora";
import { execSync } from "child_process";

const SPICETIFY_PATH =
  process.env.SPICETIFY_PATH || `${process.env.HOME}/.spicetify/spicetify`;

function run(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 15000 }).trim();
  } catch {
    return "";
  }
}

function spicetify(args: string): string {
  return run(`"${SPICETIFY_PATH}" ${args}`);
}

// --- Subcommands ---

function showStatus() {
  const config = spicetify("config");
  if (!config) {
    console.log(chalk.red("Spicetify not found or not configured."));
    return;
  }

  const get = (key: string) => {
    const match = config.match(new RegExp(`^${key}\\s+(.+)$`, "m"));
    return match?.[1]?.trim() || "—";
  };

  const version = spicetify("--version") || "unknown";
  const theme = get("current_theme");
  const scheme = get("color_scheme");
  const extensions = get("extensions");
  const customApps = get("custom_apps");
  const sentry = get("disable_sentry") === "1" ? "blocked" : "active";
  const logging = get("disable_ui_logging") === "1" ? "blocked" : "active";

  console.log("");
  console.log(chalk.green.bold("  ♫ Spicetify Status"));
  console.log(chalk.dim("  " + "─".repeat(40)));
  console.log(`  ${chalk.bold("Version")}:      ${version}`);
  console.log(`  ${chalk.bold("Theme")}:        ${chalk.magenta(theme)} (${scheme})`);
  console.log(`  ${chalk.bold("Extensions")}:   ${extensions}`);
  console.log(`  ${chalk.bold("Custom Apps")}:  ${customApps}`);
  console.log(
    `  ${chalk.bold("Sentry")}:       ${sentry === "blocked" ? chalk.green(sentry) : chalk.yellow(sentry)}`
  );
  console.log(
    `  ${chalk.bold("UI Logging")}:   ${logging === "blocked" ? chalk.green(logging) : chalk.yellow(logging)}`
  );
  console.log("");
}

function switchTheme(themeName: string) {
  const THEMES: Record<string, { theme: string; scheme: string }> = {
    "mocha": { theme: "catppuccin", scheme: "mocha" },
    "macchiato": { theme: "catppuccin", scheme: "macchiato" },
    "frappe": { theme: "catppuccin", scheme: "frappe" },
    "latte": { theme: "catppuccin", scheme: "latte" },
    "dark": { theme: "Dribbblish", scheme: "dark" },
    "dracula": { theme: "Dribbblish", scheme: "dracula" },
    "nord": { theme: "Dribbblish", scheme: "nord-dark" },
    "gruvbox": { theme: "Dribbblish", scheme: "gruvbox" },
    "rosepine": { theme: "Dribbblish", scheme: "rosepine" },
    "default": { theme: "SpicetifyDefault", scheme: "" },
  };

  const choice = THEMES[themeName];
  if (!choice) {
    console.log(chalk.red(`Unknown theme: ${themeName}`));
    console.log(chalk.dim("  Available: " + Object.keys(THEMES).join(", ")));
    return;
  }

  const spinner = ora(`Applying ${themeName}...`).start();
  spicetify(`config current_theme ${choice.theme}`);
  if (choice.scheme) {
    spicetify(`config color_scheme ${choice.scheme}`);
  }
  spicetify("apply");
  spinner.succeed(chalk.green(`Applied: ${themeName}`));
  console.log(chalk.dim("  Restart Spotify if it doesn't update automatically."));
}

function applyConfig() {
  const spinner = ora("Applying spicetify config...").start();
  const result = spicetify("apply");
  if (result) {
    spinner.succeed(chalk.green("Config applied!"));
  } else {
    spinner.fail(chalk.red("Failed to apply config."));
  }
}

function restartSpotify() {
  const spinner = ora("Restarting Spotify...").start();
  run("pkill -x Spotify");
  setTimeout(() => {
    run("open -a Spotify");
    spinner.succeed(chalk.green("Spotify restarted!"));
  }, 1000);
}

function backupApply() {
  const spinner = ora("Running backup & apply...").start();
  spicetify("backup apply");
  spinner.succeed(chalk.green("Backup & apply complete!"));
  console.log(chalk.dim("  Restart Spotify to see changes."));
}

function restore() {
  const spinner = ora("Restoring Spotify to original...").start();
  spicetify("restore");
  spinner.succeed(chalk.green("Spotify restored!"));
}

function showUsage() {
  console.log(chalk.cyan("Usage: spotify <action>"));
  console.log(chalk.dim("  status             View current config"));
  console.log(chalk.dim("  theme <name>       Switch theme (mocha, macchiato, frappe, latte, dark, dracula, nord, gruvbox, rosepine, default)"));
  console.log(chalk.dim("  apply              Apply current config"));
  console.log(chalk.dim("  restart            Restart Spotify"));
  console.log(chalk.dim("  fix                Backup & apply (after Spotify update)"));
  console.log(chalk.dim("  restore            Restore original Spotify"));
}

// --- Main Entry ---

export async function runSpicetify(subcommand?: string, arg?: string) {
  if (!subcommand) {
    showUsage();
    return;
  }

  switch (subcommand) {
    case "status":
      showStatus();
      break;
    case "theme":
      if (!arg) {
        console.log(chalk.dim("Usage: spotify theme <name>"));
        console.log(chalk.dim("  Available: mocha, macchiato, frappe, latte, dark, dracula, nord, gruvbox, rosepine, default"));
      } else {
        switchTheme(arg);
      }
      break;
    case "apply":
      applyConfig();
      break;
    case "restart":
      restartSpotify();
      break;
    case "fix":
      backupApply();
      break;
    case "restore":
      restore();
      break;
    default:
      // Try as theme name
      switchTheme(subcommand);
      break;
  }
}
