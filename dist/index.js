"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
const ora_1 = __importDefault(require("ora"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const systeminformation_1 = __importDefault(require("systeminformation"));
const os_1 = __importDefault(require("os"));
if (ffmpeg_static_1.default) {
    fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_static_1.default);
}
const program = new commander_1.Command();
const youtubedl = require("youtube-dl-exec");
// --- Commands ---
async function runNeofetch() {
    const cpu = await systeminformation_1.default.cpu();
    const mem = await systeminformation_1.default.mem();
    const osInfo = await systeminformation_1.default.osInfo();
    console.log(chalk_1.default.cyan(`
      .                 OS: ${osInfo.distro} ${osInfo.release}
     / \\                Host: ${os_1.default.hostname()}
    /   \\               Kernel: ${os_1.default.release()}
   /  |  \\              Uptime: ${(os_1.default.uptime() / 3600).toFixed(2)} hours
  /___|___\\             Shell: ${process.env.SHELL || "unknown"}
      |                 CPU: ${cpu.manufacturer} ${cpu.brand}
      |                 Memory: ${(mem.used / 1024 / 1024 / 1024).toFixed(2)}GiB / ${(mem.total / 1024 / 1024 / 1024).toFixed(2)}GiB
  `));
}
async function downloadYouTube(url, format, start, end) {
    const spinner = (0, ora_1.default)("Initializing yt-dlp...").start();
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
        const outputPath = path_1.default.resolve(process.cwd(), filename);
        spinner.text = `Downloading: ${title}`;
        const flags = {
            output: outputPath,
            noWarnings: true,
            noCheckCertificates: true,
            preferFreeFormats: true,
            ffmpegLocation: ffmpeg_static_1.default,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        };
        if (format === "audio") {
            flags.extractAudio = true;
            flags.audioFormat = "mp3";
            flags.format = "bestaudio/best";
        }
        else {
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
        if ((start || end) && ffmpeg_static_1.default) {
            spinner.text = "Trimming...";
            const tempPath = outputPath + ".tmp";
            fs_1.default.renameSync(outputPath, tempPath);
            await new Promise((resolve, reject) => {
                let command = (0, fluent_ffmpeg_1.default)(tempPath);
                if (start)
                    command = command.setStartTime(start);
                if (end)
                    command = command.setDuration(end);
                command
                    .save(outputPath)
                    .on("end", () => {
                    fs_1.default.unlinkSync(tempPath);
                    resolve();
                })
                    .on("error", (err) => reject(err));
            });
        }
        spinner.succeed(chalk_1.default.green(`Downloaded to ${filename}`));
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        spinner.fail(chalk_1.default.red(`Error: ${msg}`));
    }
}
// --- Main Loop ---
async function main() {
    console.clear();
    console.log(chalk_1.default.green(figlet_1.default.textSync("Mtosity", { horizontalLayout: "full" })));
    console.log(chalk_1.default.dim("Welcome to Mtosity CLI. Type 'help' for commands.\n"));
    while (true) {
        const { input } = await inquirer_1.default.prompt([{
                type: "input",
                name: "input",
                message: chalk_1.default.green("mtosity >"),
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
                    const { inputUrl } = await inquirer_1.default.prompt([{
                            type: "input",
                            name: "inputUrl",
                            message: "Enter YouTube URL:",
                        }]);
                    url = inputUrl;
                }
                if (url)
                    await downloadYouTube(url, "video", args[1], args[2]);
                break;
            case "yt-mp3":
                let urlMp3 = args[0];
                if (!urlMp3) {
                    const { inputUrl } = await inquirer_1.default.prompt([{
                            type: "input",
                            name: "inputUrl",
                            message: "Enter YouTube URL:",
                        }]);
                    urlMp3 = inputUrl;
                }
                if (urlMp3)
                    await downloadYouTube(urlMp3, "audio", args[1], args[2]);
                break;
            case "clear":
                console.clear();
                break;
            case "exit":
                console.log(chalk_1.default.green("Goodbye!"));
                process.exit(0);
            case "":
                break;
            case "help":
                console.log(chalk_1.default.cyan("Commands: neofetch, yt <url>, yt-mp3 <url>, clear, exit"));
                break;
            default:
                console.log(chalk_1.default.red(`Unknown command: ${cmd}`));
                break;
        }
    }
}
main().catch(console.error);
