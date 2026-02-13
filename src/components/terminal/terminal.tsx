"use client";

import { useRef, useEffect } from "react";
import { useTerminal } from "./use-terminal";
import { TerminalLine } from "./terminal-line";
import { CommandPrompt } from "./command-prompt";

export function Terminal() {
  const { lines, executeCommand, navigateHistory, inputRef, focusInput } =
    useTerminal();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div
      className="flex flex-col h-full w-full max-w-5xl mx-auto"
      onClick={focusInput}
    >
      {/* Terminal window */}
      <div className="flex flex-col h-full rounded-xl border border-terminal-border bg-terminal-bg overflow-hidden shadow-2xl shadow-black/50">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-terminal-surface border-b border-terminal-border select-none">
          {/* Traffic light dots */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 transition-all cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 transition-all cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 transition-all cursor-pointer" />
          </div>

          {/* Tab */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-1 rounded-md bg-terminal-bg/50 text-terminal-muted text-xs">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="opacity-50"
              >
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span>user@mt-terminal: ~</span>
            </div>
          </div>

          {/* Right side placeholder for symmetry */}
          <div className="w-[52px]" />
        </div>

        {/* Terminal body */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-0.5 min-h-0"
        >
          {lines.map((line) => (
            <TerminalLine key={line.id} line={line} />
          ))}

          {/* Command prompt */}
          <CommandPrompt
            onSubmit={executeCommand}
            onNavigateHistory={navigateHistory}
            inputRef={inputRef}
          />
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-terminal-surface border-t border-terminal-border text-[10px] text-terminal-muted select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-green animate-pulse" />
              READY
            </span>
            <span>UTF-8</span>
          </div>
          <div className="flex items-center gap-3">
            <span>zsh</span>
            <span>Ln 1, Col 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
