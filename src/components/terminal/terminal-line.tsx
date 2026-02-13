"use client";

import { type TerminalLine as TLine } from "./use-terminal";

const colorMap: Record<string, string> = {
  "terminal-green": "text-terminal-green",
  "terminal-cyan": "text-terminal-cyan",
  "terminal-yellow": "text-terminal-yellow",
  "terminal-red": "text-terminal-red",
  "terminal-magenta": "text-terminal-magenta",
  "terminal-blue": "text-terminal-blue",
  "terminal-orange": "text-terminal-orange",
  "terminal-text": "text-terminal-text",
  "terminal-muted": "text-terminal-muted",
};

export function TerminalLine({ line }: { line: TLine }) {
  const colorClass = line.color ? colorMap[line.color] || "text-terminal-text" : "text-terminal-text";

  if (line.type === "input") {
    return (
      <div className="flex items-start gap-0 font-mono text-sm leading-relaxed">
        <span className="text-terminal-cyan shrink-0">❯ </span>
        <span className={colorClass}>{line.content}</span>
      </div>
    );
  }

  if (line.type === "ascii") {
    return (
      <pre className={`${colorClass} text-[10px] sm:text-xs leading-none terminal-glow select-none whitespace-pre`}>
        {line.content}
      </pre>
    );
  }

  if (line.type === "error") {
    return (
      <div className="font-mono text-sm leading-relaxed">
        <span className={colorClass}>{line.content}</span>
      </div>
    );
  }

  if (line.type === "system") {
    return (
      <div className="font-mono text-sm leading-relaxed">
        <span className={colorClass}>{line.content}</span>
      </div>
    );
  }

  // Default output
  return (
    <div className="font-mono text-sm leading-relaxed">
      <span className={colorClass}>{line.content}</span>
    </div>
  );
}
