import chalk from "chalk";

// ── ANSI helpers ──────────────────────────────────────────────────────

function write(s: string) {
  process.stdout.write(s);
}

function moveTo(row: number, col: number) {
  write(`\x1B[${row};${col}H`);
}

function clearEntireLine() {
  write("\x1B[2K");
}

function clearLineAt(row: number) {
  moveTo(row, 1);
  clearEntireLine();
}

function hideCursor() {
  write("\x1B[?25l");
}

function showCursor() {
  write("\x1B[?25h");
}

function setScrollRegion(top: number, bottom: number) {
  write(`\x1B[${top};${bottom}r`);
}

function resetScrollRegion() {
  write("\x1B[r");
}

function saveCursor() {
  write("\x1B7");
}

function restoreCursor() {
  write("\x1B8");
}

// ── Constants ───────────────────────────────────────────────────────

// Input area: top border + prompt line + bottom border + margin
const INPUT_AREA_ROWS = 4;

// ── Suggestion item ──────────────────────────────────────────────────

export interface SuggestionItem {
  name: string;
  description: string;
  label: string;
  completion: string;
  hint?: boolean;
}

// ── Renderer ─────────────────────────────────────────────────────────

export class Renderer {
  private rows: number = process.stdout.rows || 24;
  private cols: number = process.stdout.columns || 80;
  private suggestionCount: number = 0;
  private exclusive: boolean = false;
  private resizeCallbacks: Array<() => void> = [];

  constructor() {
    process.stdout.on("resize", () => {
      if (this.exclusive) return;

      const oldRows = this.rows;
      const oldCols = this.cols;
      const oldSuggestionCount = this.suggestionCount;

      // Temporarily reset scroll region so we can clear anywhere
      resetScrollRegion();

      // Clear the old input area (3 rows at the bottom)
      for (let i = 0; i < INPUT_AREA_ROWS; i++) {
        clearLineAt(oldRows - i);
      }

      // Clear old suggestion rows
      if (oldSuggestionCount > 0) {
        const oldStart = oldRows - INPUT_AREA_ROWS + 1 - oldSuggestionCount;
        for (let i = 0; i < oldSuggestionCount; i++) {
          clearLineAt(oldStart + i);
        }
      }

      // Update dimensions
      this.rows = process.stdout.rows || 24;
      this.cols = process.stdout.columns || 80;

      // Re-establish scroll region
      this.setupScrollRegion();

      // Let InputHandler redraw with current buffer state
      for (const cb of this.resizeCallbacks) {
        cb();
      }
    });
  }

  onResize(cb: () => void): void {
    this.resizeCallbacks.push(cb);
  }

  getRows(): number {
    return this.rows;
  }

  getCols(): number {
    return this.cols;
  }

  // Row positions for the 3-row input area
  private get topBorderRow(): number {
    return this.rows - 3;
  }

  private get inputRow(): number {
    return this.rows - 2;
  }

  private get bottomBorderRow(): number {
    return this.rows - 1;
  }

  private drawBorder(row: number): void {
    clearLineAt(row);
    write(chalk.dim("─".repeat(this.cols)));
  }

  // Set scroll region so output stays above input area
  setupScrollRegion(): void {
    const outputBottom = this.topBorderRow - 1 - this.suggestionCount;
    setScrollRegion(1, Math.max(1, outputBottom));
  }

  // Draw the bordered input area
  drawInput(buffer: string, cursorPos: number): void {
    const prompt = chalk.green("❯ ");
    const promptLen = 2; // "❯ " is 2 visible chars

    saveCursor();

    // Top border
    this.drawBorder(this.topBorderRow);

    // Input line
    clearLineAt(this.inputRow);
    write(prompt + buffer);

    // Bottom border
    this.drawBorder(this.bottomBorderRow);

    // Position cursor on the input line
    moveTo(this.inputRow, promptLen + cursorPos + 1);
    showCursor();
  }

  // Draw suggestion dropdown above the input area
  drawSuggestions(suggestions: SuggestionItem[], selectedIndex: number): void {
    hideCursor();

    // Clear old suggestion rows if count changed
    const oldCount = this.suggestionCount;
    const newCount = suggestions.length;

    if (oldCount > 0) {
      const oldStart = this.topBorderRow - oldCount;
      for (let i = 0; i < oldCount; i++) {
        clearLineAt(oldStart + i);
      }
    }

    this.suggestionCount = newCount;

    if (newCount === 0) {
      this.setupScrollRegion();
      return;
    }

    // Adjust scroll region to make room for suggestions + input area
    this.setupScrollRegion();

    const startRow = this.topBorderRow - newCount;

    for (let i = 0; i < newCount; i++) {
      const row = startRow + i;
      const item = suggestions[i];
      const isSelected = i === selectedIndex && !item.hint;

      clearLineAt(row);

      const label = item.hint ? `<${item.label}>` : item.label;
      const desc = item.description;
      const padding = Math.max(1, 24 - label.length);

      if (item.hint) {
        write(
          chalk.dim(` ${label}` + " ".repeat(padding) + desc)
        );
      } else if (isSelected) {
        write(
          chalk.bgGreen.black.bold(` ${label}`) +
            chalk.bgGreen.black(" ".repeat(padding) + desc + " ")
        );
      } else {
        write(
          chalk.green(` ${label}`) +
            chalk.dim(" ".repeat(padding) + desc)
        );
      }
    }
  }

  // Clear any visible suggestions
  clearSuggestions(): void {
    if (this.suggestionCount === 0) return;

    const startRow = this.topBorderRow - this.suggestionCount;
    for (let i = 0; i < this.suggestionCount; i++) {
      clearLineAt(startRow + i);
    }
    this.suggestionCount = 0;

    // Restore scroll region to full output area
    this.setupScrollRegion();
  }

  // Prepare the terminal for command output
  prepareForCommand(): void {
    this.clearSuggestions();
    hideCursor();
    // Clear the input area (4 rows including margin)
    clearLineAt(this.topBorderRow);
    clearLineAt(this.inputRow);
    clearLineAt(this.bottomBorderRow);
    clearLineAt(this.rows);
    // Reset scroll region so commands can use full output area
    resetScrollRegion();
    // Move cursor to the bottom so new output appears there
    moveTo(this.rows, 1);
  }

  // Restore our UI after a command finishes
  restoreAfterCommand(): void {
    this.rows = process.stdout.rows || 24;
    this.cols = process.stdout.columns || 80;
    this.setupScrollRegion();
  }

  // Enter exclusive mode (for games that need full screen)
  enterExclusive(): void {
    this.exclusive = true;
    resetScrollRegion();
    hideCursor();
    write("\x1B[2J\x1B[1;1H"); // clear screen
  }

  // Exit exclusive mode (game finished)
  exitExclusive(): void {
    this.exclusive = false;
    write("\x1B[2J\x1B[1;1H"); // clear screen
    showCursor();
    this.rows = process.stdout.rows || 24;
    this.cols = process.stdout.columns || 80;
    this.setupScrollRegion();
  }
}
