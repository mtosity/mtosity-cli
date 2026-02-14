import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import path from "path";
import { ffmpeg, ffmpegPath, youtubedl } from "../utils/ffmpeg";

export async function downloadYouTube(
  url: string,
  format: "video" | "audio",
  start?: string,
  end?: string
) {
  const spinner = ora("Initializing yt-dlp...").start();
  try {
    spinner.text = "Fetching metadata...";
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    });

    const title = info.title || "video";
    const safeTitle =
      title.replace(/[^a-zA-Z0-9_\-\s]/g, "").replace(/\s+/g, "_") ||
      "download";
    const ext = format === "audio" ? "mp3" : "mp4";
    const filename = `${safeTitle}.${ext}`;
    const outputPath = path.resolve(process.cwd(), filename);

    spinner.text = `Downloading: ${title}`;

    const flags: any = {
      output: outputPath,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      ffmpegLocation: ffmpegPath,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    };

    if (format === "audio") {
      flags.extractAudio = true;
      flags.audioFormat = "mp3";
      flags.format = "bestaudio/best";
    } else {
      flags.format = "bestvideo+bestaudio/best";
      flags.mergeOutputFormat = "mp4";
    }

    await youtubedl(url, flags);

    if ((start || end) && ffmpegPath) {
      spinner.text = "Trimming...";
      const tempPath = outputPath + ".tmp";
      fs.renameSync(outputPath, tempPath);

      await new Promise<void>((resolve, reject) => {
        let command = ffmpeg(tempPath);
        if (start) command = command.setStartTime(start);
        if (end) command = command.setDuration(end);

        command
          .save(outputPath)
          .on("end", () => {
            fs.unlinkSync(tempPath);
            resolve();
          })
          .on("error", (err) => reject(err));
      });
    }

    spinner.succeed(chalk.green(`Downloaded to ${filename}`));
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    spinner.fail(chalk.red(`Error: ${msg}`));
  }
}
