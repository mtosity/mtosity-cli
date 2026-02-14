import chalk from "chalk";
import { PIECES } from "./pieces";
import { Board, BOARD_W, BOARD_H, ActivePiece, dropDistance } from "./board";
import { moveTo } from "../terminal";

// Modern block rendering — each cell is 2 chars wide using colored full-blocks
const PIECE_COLORS: [number, number, number][] = [
  [0, 240, 240],   // I — cyan
  [240, 240, 0],   // O — yellow
  [180, 0, 255],   // T — purple
  [0, 240, 0],     // S — green
  [240, 0, 0],     // Z — red
  [0, 100, 240],   // J — blue
  [255, 165, 0],   // L — orange
];

function cellBlock(colorIdx: number): string {
  const [r, g, b] = PIECE_COLORS[colorIdx - 1];
  // Bright face + slightly darker shadow for 3D effect
  return chalk.rgb(r, g, b)("█") + chalk.rgb(
    Math.floor(r * 0.6),
    Math.floor(g * 0.6),
    Math.floor(b * 0.6)
  )("█");
}

function ghostBlock(colorIdx: number): string {
  const [r, g, b] = PIECE_COLORS[colorIdx - 1];
  return chalk.rgb(
    Math.floor(r * 0.3),
    Math.floor(g * 0.3),
    Math.floor(b * 0.3)
  )("░░");
}

const EMPTY = chalk.gray.dim("··");

// Box-drawing
const TL = chalk.gray("╔");
const TR = chalk.gray("╗");
const BL = chalk.gray("╚");
const BR = chalk.gray("╝");
const HZ = chalk.gray("══");
const VT = chalk.gray("║");

export interface TetrisState {
  board: Board;
  active: ActivePiece | null;
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  nextPieceIndex?: number;
}

const LEFT_PAD = 4;
const TOP_PAD = 2;

export function renderBoard(state: TetrisState): void {
  const { board, active, score, level, lines, gameOver, nextPieceIndex } = state;

  // Build display grid: positive = piece color, -N = ghost for piece N
  const display: number[][] = board.map((row) => [...row]);

  if (active) {
    // Ghost piece
    const ghostY = active.y + dropDistance(board, active);
    const grid = active.def.rotations[active.rotation % active.def.rotations.length];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (!grid[r][c]) continue;
        const bx = active.x + c;
        const by = ghostY + r;
        if (by >= 0 && by < BOARD_H && bx >= 0 && bx < BOARD_W && display[by][bx] === 0) {
          display[by][bx] = -(active.pieceIndex + 1);
        }
      }
    }

    // Active piece on top
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (!grid[r][c]) continue;
        const bx = active.x + c;
        const by = active.y + r;
        if (by >= 0 && by < BOARD_H && bx >= 0 && bx < BOARD_W) {
          display[by][bx] = active.pieceIndex + 1;
        }
      }
    }
  }

  // Top border
  moveTo(TOP_PAD, LEFT_PAD);
  process.stdout.write(TL + HZ.repeat(BOARD_W) + TR);

  // Board rows
  for (let r = 0; r < BOARD_H; r++) {
    moveTo(TOP_PAD + 1 + r, LEFT_PAD);
    let row = VT;
    for (let c = 0; c < BOARD_W; c++) {
      const val = display[r][c];
      if (val > 0) {
        row += cellBlock(val);
      } else if (val < 0) {
        row += ghostBlock(-val);
      } else {
        row += EMPTY;
      }
    }
    row += VT;
    process.stdout.write(row);
  }

  // Bottom border
  moveTo(TOP_PAD + BOARD_H + 1, LEFT_PAD);
  process.stdout.write(BL + HZ.repeat(BOARD_W) + BR);

  // ── HUD ──
  const hudCol = LEFT_PAD + BOARD_W * 2 + 7;

  // Title
  moveTo(TOP_PAD, hudCol);
  process.stdout.write(chalk.red.bold("╔══════════════════╗"));
  moveTo(TOP_PAD + 1, hudCol);
  process.stdout.write(chalk.red.bold("║") + chalk.white.bold("  BASTARD TETRIS  ") + chalk.red.bold("║"));
  moveTo(TOP_PAD + 2, hudCol);
  process.stdout.write(chalk.red.bold("╚══════════════════╝"));

  // Stats
  moveTo(TOP_PAD + 4, hudCol);
  process.stdout.write(chalk.gray("┌─────────────────┐"));
  moveTo(TOP_PAD + 5, hudCol);
  process.stdout.write(chalk.gray("│ ") + chalk.white("Score ") + chalk.yellow.bold(String(score).padStart(10)) + chalk.gray(" │"));
  moveTo(TOP_PAD + 6, hudCol);
  process.stdout.write(chalk.gray("│ ") + chalk.white("Level ") + chalk.cyan.bold(String(level).padStart(10)) + chalk.gray(" │"));
  moveTo(TOP_PAD + 7, hudCol);
  process.stdout.write(chalk.gray("│ ") + chalk.white("Lines ") + chalk.green.bold(String(lines).padStart(10)) + chalk.gray(" │"));
  moveTo(TOP_PAD + 8, hudCol);
  process.stdout.write(chalk.gray("└─────────────────┘"));

  // Next piece preview
  moveTo(TOP_PAD + 10, hudCol);
  process.stdout.write(chalk.white.bold("  NEXT"));
  moveTo(TOP_PAD + 11, hudCol);
  process.stdout.write(chalk.gray("┌────────────┐"));

  if (nextPieceIndex !== undefined) {
    const nextDef = PIECES[nextPieceIndex];
    const nextGrid = nextDef.rotations[0];
    for (let r = 0; r < Math.min(nextGrid.length, 4); r++) {
      moveTo(TOP_PAD + 12 + r, hudCol);
      let line = chalk.gray("│") + "  ";
      for (let c = 0; c < nextGrid[r].length; c++) {
        if (nextGrid[r][c]) {
          line += cellBlock(nextPieceIndex + 1);
        } else {
          line += "  ";
        }
      }
      // pad to fill the box
      const padLen = 10 - nextGrid[r].length * 2;
      line += " ".repeat(Math.max(0, padLen)) + chalk.gray("│");
      process.stdout.write(line);
    }
    const extraRows = 4 - Math.min(nextGrid.length, 4);
    for (let r = 0; r < extraRows; r++) {
      moveTo(TOP_PAD + 12 + Math.min(nextGrid.length, 4) + r, hudCol);
      process.stdout.write(chalk.gray("│") + " ".repeat(12) + chalk.gray("│"));
    }
  } else {
    for (let r = 0; r < 4; r++) {
      moveTo(TOP_PAD + 12 + r, hudCol);
      process.stdout.write(chalk.gray("│") + " ".repeat(12) + chalk.gray("│"));
    }
    moveTo(TOP_PAD + 13, hudCol + 1);
    process.stdout.write(chalk.red.dim(" The worst "));
    moveTo(TOP_PAD + 14, hudCol + 1);
    process.stdout.write(chalk.red.dim("   one...  "));
  }
  moveTo(TOP_PAD + 16, hudCol);
  process.stdout.write(chalk.gray("└────────────┘"));

  // Controls
  moveTo(TOP_PAD + 18, hudCol);
  process.stdout.write(chalk.gray.dim("  ← →  Move"));
  moveTo(TOP_PAD + 19, hudCol);
  process.stdout.write(chalk.gray.dim("   ↑   Rotate"));
  moveTo(TOP_PAD + 20, hudCol);
  process.stdout.write(chalk.gray.dim("   ↓   Soft drop"));
  moveTo(TOP_PAD + 21, hudCol);
  process.stdout.write(chalk.gray.dim(" SPACE  Hard drop"));
  moveTo(TOP_PAD + 22, hudCol);
  process.stdout.write(chalk.gray.dim("   Q   Quit"));

  if (gameOver) {
    // Draw game over overlay on the board
    const midRow = TOP_PAD + Math.floor(BOARD_H / 2);
    const midCol = LEFT_PAD + 1;
    const boxW = BOARD_W * 2;

    moveTo(midRow - 1, midCol);
    process.stdout.write(chalk.bgRed(" ".repeat(boxW)));
    moveTo(midRow, midCol);
    const goText = "  GAME OVER  ";
    const goPad = Math.floor((boxW - goText.length) / 2);
    process.stdout.write(chalk.bgRed(" ".repeat(goPad) + chalk.white.bold(goText) + " ".repeat(boxW - goPad - goText.length)));
    moveTo(midRow + 1, midCol);
    const qText = "Press Q to exit";
    const qPad = Math.floor((boxW - qText.length) / 2);
    process.stdout.write(chalk.bgRed(" ".repeat(qPad) + chalk.white(qText) + " ".repeat(boxW - qPad - qText.length)));
    moveTo(midRow + 2, midCol);
    process.stdout.write(chalk.bgRed(" ".repeat(boxW)));
  }
}
