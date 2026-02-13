import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

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

export const maxDuration = 60; // Vercel serverless function timeout (seconds)

interface YouTubeRequestBody {
  url: string;
  format: "video" | "mp3";
  start?: string;
  end?: string;
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

  try {
    const body: YouTubeRequestBody = await request.json();
    const { url, format } = body;

    if (!url || !ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: "Missing or invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Get video info for the title
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title
      .replace(/[^a-zA-Z0-9_\-\s]/g, "")
      .substring(0, 80);
    const safeTitle = title.replace(/\s+/g, "_") || "download";

    // Download the stream into memory
    const ext = format === "mp3" ? "mp3" : "mp4";
    const chunks: Buffer[] = [];

    const stream =
      format === "mp3"
        ? ytdl(url, { filter: "audioonly", quality: "highestaudio" })
        : ytdl(url, {
            filter: "audioandvideo",
            quality: "highest",
          });

    await new Promise<void>((resolve, reject) => {
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    const fileBuffer = Buffer.concat(chunks);

    // Record successful download time for rate limiting
    lastDownloadByIp.set(clientIp, Date.now());

    const contentType = format === "mp3" ? "audio/mpeg" : "video/mp4";
    const fileName = `${safeTitle}.${ext}`;

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
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
