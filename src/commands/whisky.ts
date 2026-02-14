import chalk from "chalk";
import ora from "ora";
import { execSync, spawn } from "child_process";
import fs from "fs";
import path from "path";

function run(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 10000 }).trim();
  } catch {
    return "";
  }
}

function isWhiskyInstalled(): boolean {
  return !!run("which whisky");
}

function installWhisky() {
  const spinner = ora("Installing Whisky via Homebrew...").start();
  try {
    execSync("brew install --cask whisky", {
      encoding: "utf-8",
      stdio: "pipe",
      timeout: 120000,
    });
    spinner.succeed(chalk.green("Whisky installed!"));
    console.log(
      chalk.dim("  Launch Whisky.app first to download Wine & GPTK components.")
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    spinner.fail(chalk.red(`Install failed: ${msg}`));
  }
}

async function ensureInstalled(): Promise<boolean> {
  if (isWhiskyInstalled()) return true;

  console.log(chalk.yellow("Whisky is not installed. Installing via Homebrew..."));
  installWhisky();
  return isWhiskyInstalled();
}

function runExe(filePath: string) {
  // Expand ~ to home dir
  if (filePath.startsWith("~")) {
    filePath = filePath.replace("~", process.env.HOME || "");
  }

  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    console.log(chalk.red(`File not found: ${resolved}`));
    return;
  }

  if (!resolved.toLowerCase().endsWith(".exe")) {
    console.log(chalk.yellow("Warning: File doesn't have .exe extension."));
  }

  const spinner = ora(`Launching ${path.basename(resolved)}...`).start();

  try {
    const child = spawn("whisky", ["run", resolved], {
      detached: true,
      stdio: "ignore",
    });
    child.unref();
    spinner.succeed(chalk.green(`Launched: ${path.basename(resolved)}`));
    console.log(chalk.dim("  The app is running in the background via Whisky."));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    spinner.fail(chalk.red(`Failed to launch: ${msg}`));
  }
}

function openWhiskyApp() {
  const spinner = ora("Opening Whisky...").start();
  try {
    execSync("open -a Whisky", { encoding: "utf-8" });
    spinner.succeed(chalk.green("Whisky opened!"));
  } catch {
    spinner.fail(chalk.red("Could not open Whisky.app. Is it installed?"));
  }
}

function showStatus() {
  const installed = isWhiskyInstalled();
  const appExists = fs.existsSync("/Applications/Whisky.app");

  console.log("");
  console.log(chalk.hex("#D2691E").bold("  🥃 Whisky Status"));
  console.log(chalk.dim("  " + "─".repeat(40)));
  console.log(
    `  ${chalk.bold("Installed")}:   ${installed ? chalk.green("yes") : chalk.red("no")}`
  );
  console.log(
    `  ${chalk.bold("Whisky.app")}:  ${appExists ? chalk.green("/Applications/Whisky.app") : chalk.red("not found")}`
  );

  if (installed) {
    const whiskyPath = run("which whisky");
    console.log(`  ${chalk.bold("CLI Path")}:    ${whiskyPath}`);
  }

  const bottlesDir = path.join(
    process.env.HOME || "",
    "Library/Containers/com.isaacmarovitz.Whisky/Bottles"
  );
  if (fs.existsSync(bottlesDir)) {
    const bottles = fs
      .readdirSync(bottlesDir)
      .filter((f) => fs.statSync(path.join(bottlesDir, f)).isDirectory());
    console.log(
      `  ${chalk.bold("Bottles")}:     ${bottles.length > 0 ? bottles.join(", ") : "none"}`
    );
  }
  console.log("");
}

function showUsage() {
  console.log(chalk.cyan("Usage: whisky <action>"));
  console.log(chalk.dim("  status             Check Whisky installation"));
  console.log(chalk.dim("  run <file.exe>     Run a Windows .exe file"));
  console.log(chalk.dim("  open               Open Whisky.app GUI"));
  console.log(chalk.dim("  install            Install Whisky via Homebrew"));
}

// --- Main Entry ---

export async function runWhisky(subcommand?: string, arg?: string) {
  if (!subcommand) {
    showUsage();
    return;
  }

  switch (subcommand) {
    case "status":
      showStatus();
      break;
    case "run":
      if (!arg) {
        console.log(chalk.dim("Usage: whisky run <path/to/file.exe>"));
      } else {
        if (!(await ensureInstalled())) return;
        runExe(arg);
      }
      break;
    case "open":
      if (!(await ensureInstalled())) return;
      openWhiskyApp();
      break;
    case "install":
      if (isWhiskyInstalled()) {
        console.log(chalk.green("Whisky is already installed!"));
      } else {
        installWhisky();
      }
      break;
    default:
      // Treat as file path
      if (subcommand.endsWith(".exe") || subcommand.includes("/")) {
        if (!(await ensureInstalled())) return;
        runExe(subcommand);
      } else {
        console.log(chalk.red(`Unknown action: ${subcommand}`));
        showUsage();
      }
      break;
  }
}
