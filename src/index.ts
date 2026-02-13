import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import ora from "ora";
import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import si from "systeminformation";
import os from "os";

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const program = new Command();

const youtubedl = require("youtube-dl-exec");

// --- Commands ---

async function runNeofetch() {
  const cpu = await si.cpu();
  const mem = await si.mem();
  const osInfo = await si.osInfo();
  
  console.log(chalk.cyan(`
      .                 OS: ${osInfo.distro} ${osInfo.release}
     / \\                Host: ${os.hostname()}
    /   \\               Kernel: ${os.release()}
   /  |  \\              Uptime: ${(os.uptime() / 3600).toFixed(2)} hours
  /___|___\\             Shell: ${process.env.SHELL || "unknown"}
      |                 CPU: ${cpu.manufacturer} ${cpu.brand}
      |                 Memory: ${(mem.used / 1024 / 1024 / 1024).toFixed(2)}GiB / ${(mem.total / 1024 / 1024 / 1024).toFixed(2)}GiB
  `));
}

async function downloadYouTube(url: string, format: "video" | "audio", start?: string, end?: string) {
  const spinner = ora("Initializing yt-dlp...").start();
  try {
     // Get title first for filename (optional, or just use generic and rename? yt-dlp can output template)
     // But we want to show title in spinner.
     spinner.text = "Fetching metadata...";
     const info = await youtubedl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noCheckCertificates: true,
        preferFreeFormats: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
     });

     const title = info.title || "video";
     const safeTitle = title.replace(/[^a-zA-Z0-9_\-\s]/g, "").replace(/\s+/g, "_") || "download";
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
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
     };

     if (format === "audio") {
        flags.extractAudio = true;
        flags.audioFormat = "mp3";
        flags.format = "bestaudio/best";
     } else {
        flags.format = "bestvideo+bestaudio/best";
        flags.mergeOutputFormat = "mp4";
     }

     // Handling start/end trimming via post-processor args if supported, or via ffmpeg externally.
     // yt-dlp supports --download-sections usually.
     // But simpler: download then trim? Or use ffmpeg directly on stream?
     // yt-dlp can pipe to ffmpeg.
     // But `youtube-dl-exec` with `exec`?
     // For simplicity given the library constraints, let's just download first.
     // If user wants trim, we can run ffmpeg on the output file?
     // Or just let yt-dlp handle it if possible.
     // `download_ranges` is complex.
     // Let's ignore trim for now or apply it after download if user provided args.

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

// --- Main Loop ---

async function main() {
  console.clear();
  console.log(chalk.green(figlet.textSync("Mtosity", { horizontalLayout: "full" })));
  console.log(chalk.dim("Welcome to Mtosity CLI. Type 'help' for commands.\n"));

  while (true) {
    const { input } = await inquirer.prompt([{
      type: "input",
      name: "input",
      message: chalk.green("mtosity >"),
      prefix: ""
    }]);

    const parts = input.trim().split(" ");
    const cmd = parts[0];
    const args = parts.slice(1);
    
    switch (cmd) {
      case "neofetch":
        await runNeofetch();
        break;
      
      case "yt":
        let url = args[0];
        if (!url) {
          const { inputUrl } = await inquirer.prompt([{
            type: "input",
            name: "inputUrl",
            message: "Enter YouTube URL:",
          }]);
          url = inputUrl;
        }
        if (url) await downloadYouTube(url, "video", args[1], args[2]);
        break;

      case "yt-mp3":
        let urlMp3 = args[0];
        if (!urlMp3) {
          const { inputUrl } = await inquirer.prompt([{
            type: "input",
            name: "inputUrl",
            message: "Enter YouTube URL:",
          }]);
          urlMp3 = inputUrl;
        }
        if (urlMp3) await downloadYouTube(urlMp3, "audio", args[1], args[2]);
        break;

      case "clear":
        console.clear();
        break;
        
      case "exit":
        console.log(chalk.green("Goodbye!"));
        process.exit(0);
        
      case "":
        break;
        
      case "help":
        console.log(chalk.cyan("Commands: neofetch, yt <url>, yt-mp3 <url>, clear, exit"));
        break;

      default:
        console.log(chalk.red(`Unknown command: ${cmd}`));
        break;
    }
  }
}

main().catch(console.error);
