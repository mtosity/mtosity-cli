import chalk from "chalk";
import ora from "ora";
import path from "path";
import { ffmpeg, ffmpegPath } from "../utils/ffmpeg";

const PRESETS: Record<string, { name: string; filter: string }> = {
  echo: {
    name: "Echo (balanced reverb + bass warmth)",
    filter:
      "bass=g=3:f=100,aecho=0.8:0.88:100|190:0.45|0.32,aecho=0.8:0.88:115:0.36,volume=1.5",
  },
  "echo-light": {
    name: "Light Echo (subtle reverb)",
    filter:
      "aecho=0.8:0.88:80|150:0.4|0.25,aecho=0.8:0.88:90:0.3,volume=1.3",
  },
  "echo-heavy": {
    name: "Heavy Echo (dramatic reverb)",
    filter:
      "aecho=0.8:0.9:200|400:0.5|0.3,aecho=0.8:0.9:150:0.4,volume=1.5",
  },
  bass: {
    name: "Bass Boost Only (+3dB warmth)",
    filter: "bass=g=3:f=100,volume=1.3",
  },
};

function showUsage() {
  console.log(chalk.cyan("Usage: harmonica <file> [preset]"));
  console.log(chalk.dim("  Presets: echo (default), echo-light, echo-heavy, bass"));
}

export async function enhanceHarmonica(inputFile?: string, presetArg?: string) {
  if (!ffmpegPath) {
    console.log(chalk.red("Error: ffmpeg not found. Install ffmpeg-static."));
    return;
  }

  if (!inputFile) {
    showUsage();
    return;
  }

  // Expand ~ to home dir
  if (inputFile.startsWith("~")) {
    inputFile = inputFile.replace("~", process.env.HOME || "");
  }

  const preset = presetArg && presetArg in PRESETS ? presetArg : "echo";
  const filter = PRESETS[preset].filter;
  const ext = path.extname(inputFile);
  const base = path.basename(inputFile, ext);
  const dir = path.dirname(inputFile);
  const outputFile = path.join(dir, `${base}_enhanced${ext}`);

  const spinner = ora(`Applying "${preset}" preset...`).start();

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputFile!)
        .audioFilters(filter)
        .outputOptions("-c:v", "copy")
        .save(outputFile)
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });

    spinner.succeed(chalk.green(`Enhanced → ${path.basename(outputFile)}`));
    console.log(chalk.dim(`  Preset: ${PRESETS[preset].name}`));
    console.log(chalk.dim(`  Output: ${outputFile}`));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    spinner.fail(chalk.red(`Error: ${msg}`));
  }
}
