import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;

  ffmpeg = new FFmpeg();

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return ffmpeg;
}

/**
 * Parse a time string like "00:01:30" or "1:30" or "90" into seconds.
 */
export function parseTime(time: string): number {
  const parts = time.split(":").map(Number);
  if (parts.some(isNaN)) return NaN;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return NaN;
}

/**
 * Format seconds into HH:MM:SS for ffmpeg.
 */
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export interface TrimOptions {
  start?: number; // seconds
  end?: number; // seconds
  format: "mp4" | "mp3";
}

/**
 * Trim a media blob using ffmpeg.wasm.
 * Returns a new trimmed blob.
 */
export async function trimMedia(
  blob: Blob,
  options: TrimOptions,
  onProgress?: (message: string) => void
): Promise<Blob> {
  onProgress?.("Loading ffmpeg...");
  const ff = await getFFmpeg();

  const inputName = `input.${options.format}`;
  const outputName = `output.${options.format}`;

  onProgress?.("Processing file...");
  const inputData = await fetchFile(blob);
  await ff.writeFile(inputName, inputData);

  const args: string[] = [];

  if (options.start !== undefined) {
    args.push("-ss", formatTime(options.start));
  }

  args.push("-i", inputName);

  if (options.end !== undefined) {
    const duration =
      options.start !== undefined
        ? options.end - options.start
        : options.end;
    if (duration > 0) {
      args.push("-t", formatTime(duration));
    }
  }

  args.push("-c", "copy", outputName);

  onProgress?.("Trimming...");
  await ff.exec(args);

  const data = await ff.readFile(outputName);
  const mimeType = options.format === "mp3" ? "audio/mpeg" : "video/mp4";
  const trimmedBlob = new Blob([new Uint8Array(data as Uint8Array)], { type: mimeType });

  // Cleanup
  await ff.deleteFile(inputName);
  await ff.deleteFile(outputName);

  return trimmedBlob;
}
