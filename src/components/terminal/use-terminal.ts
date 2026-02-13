"use client";

import { useState, useCallback, useRef } from "react";
import { parseYouTubeCommand } from "@/lib/commands";
import { trimMedia, parseTime } from "@/lib/ffmpeg";

export interface TerminalLineBase {
  id: string;
  type: "input" | "output" | "ascii" | "error" | "system" | "loading" | "link";
  content: string;
  color?: string;
  delay?: number;
}

export interface TerminalLinkLine extends TerminalLineBase {
  type: "link";
  href: string;
  fileName: string;
}

export type TerminalLine = TerminalLineBase | TerminalLinkLine;

const ASCII_BANNER = `
 ███    ███ ████████  ██████  ███████ ██ ████████ ██    ██
 ████  ████    ██    ██    ██ ██      ██    ██     ██  ██ 
 ██ ████ ██    ██    ██    ██ ███████ ██    ██      ████  
 ██  ██  ██    ██    ██    ██      ██ ██    ██       ██   
 ██      ██    ██     ██████  ███████ ██    ██       ██   
                                                         
 ████████ ███████ ██████  ███    ███ ██ ███    ██  █████  ██      
    ██    ██      ██   ██ ████  ████ ██ ████   ██ ██   ██ ██      
    ██    █████   ██████  ██ ████ ██ ██ ██ ██  ██ ███████ ██      
    ██    ██      ██   ██ ██  ██  ██ ██ ██  ██ ██ ██   ██ ██      
    ██    ███████ ██   ██ ██      ██ ██ ██   ████ ██   ██ ███████ `.trim();

const NEOFETCH = [
  { content: "                    user@mtosity-terminal", color: "terminal-green" },
  { content: "       ▄▄▄▄▄▄▄      ─────────────────", color: "terminal-muted" },
  { content: "      ██     ██      OS: Next.js 15 (App Router)", color: "terminal-text" },
  { content: "     ██  ▀▀  ██      Host: Vercel Edge Runtime", color: "terminal-text" },
  { content: "    ████████████     Kernel: React 19", color: "terminal-text" },
  { content: "   ██ ████████ ██   Uptime: since 2026", color: "terminal-text" },
  { content: "  ██  ████████  ██  Packages: shadcn/ui, tailwind", color: "terminal-text" },
  { content: " ██   ████████   ██ Shell: zsh 5.9", color: "terminal-text" },
  { content: "██    ████████    ██ Resolution: responsive", color: "terminal-text" },
  { content: "██    ██    ██    ██ Theme: Terminal Dark [GTK3]", color: "terminal-text" },
  { content: " ██   ██    ██   ██ Icons: Lucide", color: "terminal-text" },
  { content: "  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀   Font: JetBrains Mono", color: "terminal-text" },
  { content: "", color: "terminal-text" },
  { content: "  ███████████████   Memory: ∞ / ∞ MB", color: "terminal-text" },
];

const HELP_TEXT = [
  { content: "", color: "terminal-text" },
  { content: "  Available Commands:", color: "terminal-yellow" },
  { content: "  ─────────────────────────────────────", color: "terminal-muted" },
  { content: "  help          Show this help message", color: "terminal-text" },
  { content: "  neofetch      System information", color: "terminal-text" },
  { content: "  clear         Clear the terminal", color: "terminal-text" },
  { content: "", color: "terminal-text" },
  { content: "  YouTube:", color: "terminal-yellow" },
  { content: "  ─────────────────────────────────────", color: "terminal-muted" },
  { content: "  yt <url> [start] [end]       Download video", color: "terminal-text" },
  { content: "  yt-mp3 <url> [start] [end]   Download audio (MP3)", color: "terminal-text" },
  { content: "  Time format: MM:SS or HH:MM:SS", color: "terminal-muted" },
  { content: "", color: "terminal-text" },
  { content: "  Tip: Use ↑/↓ arrows to navigate command history", color: "terminal-muted" },
  { content: "", color: "terminal-text" },
];

let lineIdCounter = 0;
function createLine(
  type: TerminalLineBase["type"],
  content: string,
  color?: string
): TerminalLine {
  return {
    id: `line-${lineIdCounter++}`,
    type,
    content,
    color,
  };
}

function createLinkLine(
  content: string,
  href: string,
  fileName: string
): TerminalLinkLine {
  return {
    id: `line-${lineIdCounter++}`,
    type: "link",
    content,
    color: "terminal-cyan",
    href,
    fileName,
  };
}

const WELCOME_LINES: TerminalLine[] = [
  createLine("ascii", ASCII_BANNER, "terminal-green"),
  createLine("system", "", undefined),
  createLine("system", "  Welcome to MTosity Terminal v1.0.0", "terminal-cyan"),
  createLine("system", "  Type 'help' to see available commands.", "terminal-muted"),
  createLine("system", "", undefined),
];

export function useTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME_LINES);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const executeCommand = useCallback(
    async (input: string) => {
      const trimmed = input.trim();
      const parts = trimmed.split(/\s+/);
      const cmd = parts[0]?.toLowerCase() || "";
      const args = trimmed.substring(cmd.length).trim();

      const newLines: TerminalLine[] = [
        createLine("input", trimmed, "terminal-green"),
      ];

      // Handle YouTube commands asynchronously
      if (cmd === "yt" || cmd === "yt-mp3") {
        const format = cmd === "yt-mp3" ? "mp3" : "video";
        const parsed = parseYouTubeCommand(args, format as "video" | "mp3");

        if (!parsed.success) {
          newLines.push(createLine("error", `  ${parsed.error}`, "terminal-red"));
          newLines.push(createLine("output", `  ${parsed.usage}`, "terminal-muted"));
          newLines.push(createLine("output", "", undefined));
          setLines((prev) => [...prev, ...newLines]);
          if (trimmed) setCommandHistory((prev) => [...prev, trimmed]);
          setHistoryIndex(-1);
          return;
        }

        // Show loading state
        const loadingId = `line-${lineIdCounter++}`;
        const loadingLine: TerminalLine = {
          id: loadingId,
          type: "loading",
          content: `Downloading ${format === "mp3" ? "audio" : "video"}...`,
          color: "terminal-cyan",
        };

        setLines((prev) => [...prev, ...newLines, loadingLine]);
        if (trimmed) setCommandHistory((prev) => [...prev, trimmed]);
        setHistoryIndex(-1);
        setIsProcessing(true);

        try {
          // Step 1: Get stream URL from our API (calls Piped)
          const response = await fetch("/api/youtube", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(parsed.args),
          });

          const data = await response.json();

          if (!response.ok) {
            setLines((prev) => {
              const filtered = prev.filter((l) => l.id !== loadingId);
              return [
                ...filtered,
                createLine("error", `  Error: ${data.error || "Download failed"}`, "terminal-red"),
                createLine("output", "", undefined),
              ];
            });
            return;
          }

          // Step 2: Download the stream directly from Piped
          setLines((prev) => {
            const filtered = prev.filter((l) => l.id !== loadingId);
            const downloadingLine: TerminalLine = {
              id: loadingId,
              type: "loading",
              content: `Downloading ${format === "mp3" ? "audio" : "video"} stream...`,
              color: "terminal-cyan",
            };
            return [...filtered, downloadingLine];
          });

          const streamResponse = await fetch(data.streamUrl);
          if (!streamResponse.ok) {
            throw new Error("Failed to download stream from source");
          }
          let blob = await streamResponse.blob();

          // Step 3: Client-side trimming if start/end specified
          const { start, end } = parsed.args;
          if (start || end) {
            setLines((prev) => {
              const filtered = prev.filter((l) => l.id !== loadingId);
              const trimmingLine: TerminalLine = {
                id: loadingId,
                type: "loading",
                content: "Trimming media...",
                color: "terminal-cyan",
              };
              return [...filtered, trimmingLine];
            });

            const startSec = start ? parseTime(start) : undefined;
            const endSec = end ? parseTime(end) : undefined;
            blob = await trimMedia(blob, {
              start: startSec,
              end: endSec,
              format: format === "mp3" ? "mp3" : "mp4",
            });
          }

          // Step 4: Create download link
          const downloadUrl = URL.createObjectURL(blob);
          const fileName = data.fileName || `download.${format === "mp3" ? "mp3" : "mp4"}`;

          setLines((prev) => {
            const filtered = prev.filter((l) => l.id !== loadingId);
            return [
              ...filtered,
              createLine("output", "  ✓ Download complete!", "terminal-green"),
              createLinkLine(`Click to download: ${fileName}`, downloadUrl, fileName),
              createLine("output", "", undefined),
            ];
          });
        } catch (error) {
          const msg = error instanceof Error ? error.message : "Network error";
          setLines((prev) => {
            const filtered = prev.filter((l) => l.id !== loadingId);
            return [
              ...filtered,
              createLine("error", `  Error: ${msg}`, "terminal-red"),
              createLine("output", "", undefined),
            ];
          });
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      // Synchronous commands
      switch (cmd) {
        case "help":
          HELP_TEXT.forEach((line) =>
            newLines.push(createLine("output", line.content, line.color))
          );
          break;

        case "neofetch":
          NEOFETCH.forEach((line) =>
            newLines.push(createLine("output", line.content, line.color))
          );
          newLines.push(createLine("output", "", undefined));
          break;

        case "clear":
          setLines([]);
          setCommandHistory((prev) => [...prev, trimmed]);
          setHistoryIndex(-1);
          return;

        case "":
          break;

        default:
          newLines.push(
            createLine(
              "error",
              `  zsh: command not found: ${trimmed}`,
              "terminal-red"
            )
          );
          newLines.push(createLine("output", "", undefined));
          break;
      }

      setLines((prev) => [...prev, ...newLines]);
      if (trimmed) {
        setCommandHistory((prev) => [...prev, trimmed]);
      }
      setHistoryIndex(-1);
    },
    [commandHistory]
  );

  const navigateHistory = useCallback(
    (direction: "up" | "down") => {
      if (commandHistory.length === 0) return "";

      let newIndex: number;
      if (direction === "up") {
        newIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
      } else {
        newIndex =
          historyIndex === -1
            ? -1
            : historyIndex >= commandHistory.length - 1
              ? -1
              : historyIndex + 1;
      }

      setHistoryIndex(newIndex);
      return newIndex === -1 ? "" : commandHistory[newIndex];
    },
    [commandHistory, historyIndex]
  );

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return {
    lines,
    executeCommand,
    navigateHistory,
    inputRef,
    focusInput,
    isProcessing,
  };
}
