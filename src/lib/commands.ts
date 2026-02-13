/**
 * Parse YouTube command arguments.
 * Usage: yt <url> [start] [end]
 *        yt-mp3 <url> [start] [end]
 *
 * Timestamps can be HH:MM:SS or MM:SS
 */

const YOUTUBE_URL_REGEX =
  /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)/;

const TIMESTAMP_REGEX = /^(\d{1,2}:)?\d{1,2}:\d{2}$/;

export interface YouTubeCommandArgs {
  url: string;
  format: "video" | "mp3";
  start?: string;
  end?: string;
}

export interface ParseResult {
  success: true;
  args: YouTubeCommandArgs;
}

export interface ParseError {
  success: false;
  error: string;
  usage: string;
}

export type ParseYouTubeResult = ParseResult | ParseError;

function normalizeTimestamp(ts: string): string {
  // Ensure HH:MM:SS format
  const parts = ts.split(":");
  if (parts.length === 2) {
    return `00:${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
  }
  return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:${parts[2].padStart(2, "0")}`;
}

export function parseYouTubeCommand(
  rawArgs: string,
  format: "video" | "mp3"
): ParseYouTubeResult {
  const usage =
    format === "video"
      ? "Usage: yt <youtube-url> [start] [end]"
      : "Usage: yt-mp3 <youtube-url> [start] [end]";

  const parts = rawArgs.trim().split(/\s+/);

  if (parts.length === 0 || parts[0] === "") {
    return { success: false, error: "Missing YouTube URL.", usage };
  }

  const url = parts[0];
  if (!YOUTUBE_URL_REGEX.test(url)) {
    return {
      success: false,
      error: `Invalid YouTube URL: ${url}`,
      usage,
    };
  }

  let start: string | undefined;
  let end: string | undefined;

  if (parts.length >= 2) {
    if (!TIMESTAMP_REGEX.test(parts[1])) {
      return {
        success: false,
        error: `Invalid start time format: ${parts[1]}`,
        usage: "  Time format: MM:SS or HH:MM:SS",
      };
    }
    start = normalizeTimestamp(parts[1]);
  }

  if (parts.length >= 3) {
    if (!TIMESTAMP_REGEX.test(parts[2])) {
      return {
        success: false,
        error: `Invalid end time format: ${parts[2]}`,
        usage: "  Time format: MM:SS or HH:MM:SS",
      };
    }
    end = normalizeTimestamp(parts[2]);
  }

  if (parts.length > 3) {
    return {
      success: false,
      error: "Too many arguments.",
      usage,
    };
  }

  return {
    success: true,
    args: { url, format, start, end },
  };
}
