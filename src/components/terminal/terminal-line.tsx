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

  if (line.type === "loading") {
    return (
      <div className="font-mono text-sm leading-relaxed flex items-center gap-2">
        <span className="inline-flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-terminal-cyan animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-terminal-cyan animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-terminal-cyan animate-bounce [animation-delay:300ms]" />
        </span>
        <span className={colorClass}>{line.content}</span>
      </div>
    );
  }

  if (line.type === "link") {
    const linkLine = line as import("./use-terminal").TerminalLinkLine;
    return (
      <div className="font-mono text-sm leading-relaxed">
        <span className="text-terminal-muted">  ↳ </span>
        <a
          href={linkLine.href}
          download={linkLine.fileName}
          className="text-terminal-cyan underline underline-offset-2 hover:text-terminal-green transition-colors cursor-pointer"
        >
          📥 {line.content}
        </a>
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
