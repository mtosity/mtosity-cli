import { Renderer, SuggestionItem } from "./renderer";
import { SuggestionEngine } from "./suggestions";

export class InputHandler {
  private buffer: string = "";
  private cursorPos: number = 0;
  private history: string[] = [];
  private historyIndex: number = -1;
  private historyDraft: string = "";
  private suggestions: SuggestionItem[] = [];
  private selectedSuggestion: number = 0;
  private suggestionsVisible: boolean = false;
  private dataListener: ((data: Buffer) => void) | null = null;

  constructor(
    private renderer: Renderer,
    private suggestionEngine: SuggestionEngine
  ) {
    this.renderer.onResize(() => {
      if (this.dataListener) {
        // We're in an active readLine — redraw with current state
        this.redraw();
      }
    });
  }

  readLine(): Promise<string> {
    this.buffer = "";
    this.cursorPos = 0;
    this.historyIndex = -1;
    this.historyDraft = "";
    this.suggestions = [];
    this.selectedSuggestion = 0;
    this.suggestionsVisible = false;

    this.renderer.drawInput(this.buffer, this.cursorPos);

    return new Promise<string>((resolve) => {
      this.dataListener = (data: Buffer) => {
        const result = this.handleKey(data);
        if (result !== undefined) {
          this.detach();
          resolve(result);
        }
      };
      process.stdin.on("data", this.dataListener);
    });
  }

  detach(): void {
    if (this.dataListener) {
      process.stdin.removeListener("data", this.dataListener);
      this.dataListener = null;
    }
    this.renderer.clearSuggestions();
  }

  private handleKey(data: Buffer): string | undefined {
    const s = data.toString();

    // Ctrl+C
    if (s === "\x03") {
      return "\x03"; // signal to cli.ts
    }

    // Escape — close suggestions
    if (s === "\x1B" && !s.startsWith("\x1B[")) {
      if (this.suggestionsVisible) {
        this.closeSuggestions();
        this.redraw();
        return undefined;
      }
      return undefined;
    }

    // Enter
    if (s === "\r" || s === "\n") {
      if (this.suggestionsVisible && this.suggestions.length > 0 && !this.isHintOnly()) {
        this.acceptSuggestion();
        this.redraw();
        return undefined;
      }
      return this.handleEnter();
    }

    // Tab — accept suggestion
    if (s === "\t") {
      if (this.isHintOnly()) {
        this.redraw();
        return undefined;
      }
      return this.handleTab();
    }

    // Arrow Up
    if (s === "\x1B[A") {
      if (this.isHintOnly()) {
        this.redraw();
        return undefined;
      }
      this.handleUp();
      this.redraw();
      return undefined;
    }

    // Arrow Down
    if (s === "\x1B[B") {
      if (this.isHintOnly()) {
        this.redraw();
        return undefined;
      }
      this.handleDown();
      this.redraw();
      return undefined;
    }

    // Arrow Left
    if (s === "\x1B[D") {
      if (this.cursorPos > 0) this.cursorPos--;
      this.redraw();
      return undefined;
    }

    // Arrow Right
    if (s === "\x1B[C") {
      if (this.cursorPos < this.buffer.length) this.cursorPos++;
      this.redraw();
      return undefined;
    }

    // Home / Ctrl+A
    if (s === "\x1B[H" || s === "\x01") {
      this.cursorPos = 0;
      this.redraw();
      return undefined;
    }

    // End / Ctrl+E
    if (s === "\x1B[F" || s === "\x05") {
      this.cursorPos = this.buffer.length;
      this.redraw();
      return undefined;
    }

    // Ctrl+U — clear line
    if (s === "\x15") {
      this.buffer = "";
      this.cursorPos = 0;
      this.updateSuggestions();
      this.redraw();
      return undefined;
    }

    // Ctrl+W — delete word backward
    if (s === "\x17") {
      if (this.cursorPos > 0) {
        const before = this.buffer.slice(0, this.cursorPos);
        const after = this.buffer.slice(this.cursorPos);
        const trimmed = before.replace(/\S+\s*$/, "");
        this.buffer = trimmed + after;
        this.cursorPos = trimmed.length;
        this.updateSuggestions();
      }
      this.redraw();
      return undefined;
    }

    // Backspace
    if (s === "\x7F" || s === "\b") {
      if (this.cursorPos > 0) {
        this.buffer =
          this.buffer.slice(0, this.cursorPos - 1) +
          this.buffer.slice(this.cursorPos);
        this.cursorPos--;
        this.updateSuggestions();
      }
      this.redraw();
      return undefined;
    }

    // Delete
    if (s === "\x1B[3~") {
      if (this.cursorPos < this.buffer.length) {
        this.buffer =
          this.buffer.slice(0, this.cursorPos) +
          this.buffer.slice(this.cursorPos + 1);
        this.updateSuggestions();
      }
      this.redraw();
      return undefined;
    }

    // Regular characters (printable)
    if (s.length === 1 && s >= " ") {
      this.buffer =
        this.buffer.slice(0, this.cursorPos) +
        s +
        this.buffer.slice(this.cursorPos);
      this.cursorPos++;
      this.updateSuggestions();
      this.redraw();
      return undefined;
    }

    return undefined;
  }

  private handleEnter(): string {
    const line = this.buffer.trim();
    if (line.length > 0) {
      // Add to history (avoid duplicating the last entry)
      if (this.history.length === 0 || this.history[this.history.length - 1] !== line) {
        this.history.push(line);
      }
    }
    this.renderer.clearSuggestions();
    return line;
  }

  private handleTab(): undefined {
    if (this.suggestionsVisible && this.suggestions.length > 0) {
      this.acceptSuggestion();
    } else {
      this.updateSuggestions();
    }
    this.redraw();
    return undefined;
  }

  private handleUp(): void {
    if (this.suggestionsVisible && this.suggestions.length > 0) {
      // Navigate suggestions up
      this.selectedSuggestion =
        (this.selectedSuggestion - 1 + this.suggestions.length) %
        this.suggestions.length;
    } else {
      // Navigate history
      if (this.history.length === 0) return;
      if (this.historyIndex === -1) {
        this.historyDraft = this.buffer;
        this.historyIndex = this.history.length - 1;
      } else if (this.historyIndex > 0) {
        this.historyIndex--;
      }
      this.buffer = this.history[this.historyIndex];
      this.cursorPos = this.buffer.length;
    }
  }

  private handleDown(): void {
    if (this.suggestionsVisible && this.suggestions.length > 0) {
      // Navigate suggestions down
      this.selectedSuggestion =
        (this.selectedSuggestion + 1) % this.suggestions.length;
    } else {
      // Navigate history
      if (this.historyIndex === -1) return;
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.buffer = this.history[this.historyIndex];
      } else {
        this.historyIndex = -1;
        this.buffer = this.historyDraft;
      }
      this.cursorPos = this.buffer.length;
    }
  }

  private acceptSuggestion(): void {
    const item = this.suggestions[this.selectedSuggestion];
    if (item) {
      this.buffer = item.completion;
      this.cursorPos = this.buffer.length;
    }
    this.closeSuggestions();
  }

  private updateSuggestions(): void {
    this.suggestions = this.suggestionEngine.getSuggestions(this.buffer);
    if (this.suggestions.length > 0) {
      this.suggestionsVisible = true;
      this.selectedSuggestion = 0;
    } else {
      this.closeSuggestions();
    }
  }

  private closeSuggestions(): void {
    this.suggestionsVisible = false;
    this.suggestions = [];
    this.selectedSuggestion = 0;
    this.renderer.clearSuggestions();
  }

  private isHintOnly(): boolean {
    return this.suggestions.length > 0 && this.suggestions.every((s) => s.hint);
  }

  private redraw(): void {
    if (this.suggestionsVisible && this.suggestions.length > 0) {
      const selIdx = this.isHintOnly() ? -1 : this.selectedSuggestion;
      this.renderer.drawSuggestions(this.suggestions, selIdx);
    } else {
      this.renderer.clearSuggestions();
    }
    this.renderer.drawInput(this.buffer, this.cursorPos);
  }
}
