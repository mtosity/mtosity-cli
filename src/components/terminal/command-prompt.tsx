"use client";

import { useState, useCallback, type KeyboardEvent, type RefObject } from "react";

interface CommandPromptProps {
  onSubmit: (command: string) => void | Promise<void>;
  onNavigateHistory: (direction: "up" | "down") => string;
  inputRef: RefObject<HTMLInputElement | null>;
  disabled?: boolean;
}

export function CommandPrompt({
  onSubmit,
  onNavigateHistory,
  inputRef,
  disabled = false,
}: CommandPromptProps) {
  const [input, setInput] = useState("");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onSubmit(input);
        setInput("");
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const cmd = onNavigateHistory("up");
        setInput(cmd);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const cmd = onNavigateHistory("down");
        setInput(cmd);
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        onSubmit("clear");
        setInput("");
      }
    },
    [input, onSubmit, onNavigateHistory]
  );

  return (
    <div className="flex items-center gap-0 font-mono text-sm mt-1">
      <span className="text-terminal-cyan shrink-0">❯ </span>
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="terminal-input w-full bg-transparent text-terminal-green caret-terminal-green outline-none border-none p-0 font-mono text-sm disabled:opacity-50"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          aria-label="Terminal input"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
