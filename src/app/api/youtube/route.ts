import { NextRequest, NextResponse } from "next/server";

// --- Rate limiting: 5-second cooldown per IP ---
const COOLDOWN_MS = 5000;
const lastDownloadByIp = new Map<string, number>();

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

// Piped API instances (fallback chain)
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://api.piped.privacy.com.de",
  "https://pipedapi.ducks.party",
  "https://pipedapi.drgns.space",
  "https://pipedapi.smnz.de",
  "https://api.piped.projectsegfau.lt",
];

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

interface PipedStream {
  url: string;
  quality: string;
  mimeType: string;
  bitrate: number;
  codec: string;
  format: string;
  videoOnly?: boolean;
}

interface PipedResponse {
  title: string;
  audioStreams: PipedStream[];
  videoStreams: PipedStream[];
  duration: number;
}

async function fetchFromPiped(videoId: string): Promise<PipedResponse> {
  let lastError: Error | null = null;

  for (const instance of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${instance}/streams/${videoId}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        throw new Error(`Piped returned ${res.status}`);
      }

      const text = await res.text();
      let data: PipedResponse;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
      }

      if (!data.audioStreams && !data.videoStreams) {
        throw new Error("No streams found in response");
      }
      return data;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      continue;
    }
  }

  throw lastError || new Error("All Piped instances failed");
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
    const body = await request.json();
    const { url, format } = body as { url: string; format: "video" | "mp3" };

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Fetch stream info from Piped
    const pipedData = await fetchFromPiped(videoId);

    let streamUrl: string;
    let mimeType: string;
    const safeTitle =
      pipedData.title
        .replace(/[^a-zA-Z0-9_\-\s]/g, "")
        .replace(/\s+/g, "_")
        .substring(0, 80) || "download";

    if (format === "mp3") {
      // Pick the highest bitrate audio stream
      const audioStreams = pipedData.audioStreams
        .filter((s) => s.mimeType?.startsWith("audio/"))
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

      if (audioStreams.length === 0) {
        return NextResponse.json(
          { error: "No audio streams available for this video." },
          { status: 404 }
        );
      }

      streamUrl = audioStreams[0].url;
      mimeType = audioStreams[0].mimeType;
    } else {
      // Pick the best combined (non-videoOnly) stream, or fall back to videoOnly
      const combinedStreams = pipedData.videoStreams
        .filter((s) => !s.videoOnly && s.mimeType?.startsWith("video/"))
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

      if (combinedStreams.length > 0) {
        streamUrl = combinedStreams[0].url;
        mimeType = combinedStreams[0].mimeType;
      } else {
        // Fall back to highest bitrate video-only
        const videoOnly = pipedData.videoStreams
          .filter((s) => s.mimeType?.startsWith("video/"))
          .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

        if (videoOnly.length === 0) {
          return NextResponse.json(
            { error: "No video streams available." },
            { status: 404 }
          );
        }

        streamUrl = videoOnly[0].url;
        mimeType = videoOnly[0].mimeType;
      }
    }

    // Record download time for rate limiting
    lastDownloadByIp.set(clientIp, Date.now());

    // Return stream info — client will download directly from the stream URL
    return NextResponse.json({
      streamUrl,
      mimeType,
      title: safeTitle,
      duration: pipedData.duration,
      fileName: `${safeTitle}.${format === "mp3" ? "mp3" : "mp4"}`,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
