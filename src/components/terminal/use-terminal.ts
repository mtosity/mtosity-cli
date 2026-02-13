"use client";

import { useState, useCallback, useRef } from "react";

export interface TerminalLine {
  id: string;
  type: "input" | "output" | "ascii" | "error" | "system";
  content: string;
  color?: string;
  delay?: number;
}

const ASCII_BANNER = `
 ██    ██  ██████  ██    ██ ████████ ██    ██ ██████  ███████        
  ██  ██  ██    ██ ██    ██    ██    ██    ██ ██   ██ ██             
   ████   ██    ██ ██    ██    ██    ██    ██ ██████  █████          
    ██    ██    ██ ██    ██    ██    ██    ██ ██   ██ ██             
    ██     ██████   ██████     ██     ██████  ██████  ███████        
                                                                     
  ██████  ██    ██ ███████ ██████  ██    ██                          
 ██    ██ ██    ██ ██      ██   ██  ██  ██                           
 ██    ██ ██    ██ █████   ██████    ████                            
 ██ ▄▄ ██ ██    ██ ██      ██   ██    ██                             
  ██████   ██████  ███████ ██   ██    ██                             
      ▀▀                                                             `.trim();

const NEOFETCH = [
  { content: "                    user@mt-terminal", color: "terminal-green" },
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
  { content: "  Tip: Use ↑/↓ arrows to navigate command history", color: "terminal-muted" },
  { content: "", color: "terminal-text" },
];

let lineIdCounter = 0;
function createLine(
  type: TerminalLine["type"],
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

const WELCOME_LINES: TerminalLine[] = [
  createLine("ascii", ASCII_BANNER, "terminal-green"),
  createLine("system", "", undefined),
  createLine("system", "  Welcome to mt-terminal v1.0.0", "terminal-cyan"),
  createLine("system", "  Type 'help' to see available commands.", "terminal-muted"),
  createLine("system", "", undefined),
];

export function useTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME_LINES);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const executeCommand = useCallback(
    (input: string) => {
      const trimmed = input.trim();
      const cmd = trimmed.toLowerCase();

      const newLines: TerminalLine[] = [
        createLine("input", trimmed, "terminal-green"),
      ];

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
  };
}
