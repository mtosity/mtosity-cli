import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { existsSync, unlinkSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

// --- Rate limiting: 5-second cooldown per IP ---
const COOLDOWN_MS = 5000;
const lastDownloadByIp = new Map<string, number>();

// Periodically clean up stale entries (every 60s)
setInterval(() => {
  const now = Date.now();
  for (const [ip, ts] of lastDownloadByIp) {
    if (now - ts > COOLDOWN_MS * 10) {
      lastDownloadByIp.delete(ip);
    }
  }
}, 60_000);

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
// --- End rate limiting ---

interface YouTubeRequestBody {
  url: string;
  format: "video" | "mp3";
  start?: string;
  end?: string;
}

async function getVideoTitle(url: string): Promise<string> {
  try {
    const { stdout } = await execAsync(
      `yt-dlp --get-title --no-warnings "${url}"`,
      { timeout: 15000 }
    );
    return stdout.trim().replace(/[^a-zA-Z0-9_\-\s]/g, "").substring(0, 80);
  } catch {
    return "youtube_download";
  }
}

export async function POST(request: NextRequest) {
  // Rate limit check
  const clientIp = getClientIp(request);
  const lastDownload = lastDownloadByIp.get(clientIp);
  if (lastDownload) {
    const elapsed = Date.now() - lastDownload;
    if (elapsed < COOLDOWN_MS) {
      const waitSec = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitSec}s before downloading again.` },
        { status: 429 }
      );
    }
  }

  const tmpDir = join(tmpdir(), "mt-terminal-yt");
  if (!existsSync(tmpDir)) {
    mkdirSync(tmpDir, { recursive: true });
  }

  const id = randomUUID().slice(0, 8);
  let downloadPath = "";
  let trimmedPath = "";

  try {
    const body: YouTubeRequestBody = await request.json();
    const { url, format, start, end } = body;

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const title = await getVideoTitle(url);
    const ext = format === "mp3" ? "mp3" : "mp4";
    const safeTitle = title.replace(/\s+/g, "_") || "download";
    downloadPath = join(tmpDir, `${safeTitle}_${id}.${ext}`);

    // Build yt-dlp command
    let ytCmd: string;
    if (format === "mp3") {
      ytCmd = `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${downloadPath}" --no-warnings --no-playlist "${url}"`;
    } else {
      ytCmd = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${downloadPath}" --no-warnings --no-playlist "${url}"`;
    }

    // Download
    await execAsync(ytCmd, { timeout: 300000 }); // 5 min timeout

    if (!existsSync(downloadPath)) {
      return NextResponse.json(
        { error: "Download failed — file not found after yt-dlp completed." },
        { status: 500 }
      );
    }

    // Trim with ffmpeg if start/end specified
    let finalPath = downloadPath;
    if (start || end) {
      trimmedPath = join(tmpDir, `${safeTitle}_${id}_trimmed.${ext}`);
      let ffmpegCmd = `ffmpeg -y -i "${downloadPath}"`;
      if (start) ffmpegCmd += ` -ss ${start}`;
      if (end) ffmpegCmd += ` -to ${end}`;
      if (format === "mp3") {
        ffmpegCmd += ` -acodec libmp3lame -q:a 0`;
      } else {
        ffmpegCmd += ` -c copy`;
      }
      ffmpegCmd += ` "${trimmedPath}"`;

      await execAsync(ffmpegCmd, { timeout: 120000 });

      if (existsSync(trimmedPath)) {
        finalPath = trimmedPath;
      }
    }

    // Read and return file
    const fileBuffer = readFileSync(finalPath);
    const contentType =
      format === "mp3" ? "audio/mpeg" : "video/mp4";
    const fileName = `${safeTitle}${start || end ? "_trimmed" : ""}.${ext}`;

    // Record successful download time for rate limiting
    lastDownloadByIp.set(clientIp, Date.now());

    // Cleanup
    try {
      if (existsSync(downloadPath)) unlinkSync(downloadPath);
      if (trimmedPath && existsSync(trimmedPath)) unlinkSync(trimmedPath);
    } catch {
      // best-effort cleanup
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length.toString(),
        "X-File-Name": fileName,
      },
    });
  } catch (error) {
    // Cleanup on error
    try {
      if (downloadPath && existsSync(downloadPath)) unlinkSync(downloadPath);
      if (trimmedPath && existsSync(trimmedPath)) unlinkSync(trimmedPath);
    } catch {
      // best-effort
    }

    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
