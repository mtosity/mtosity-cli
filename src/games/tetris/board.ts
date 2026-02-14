import { PieceDef, PieceGrid } from "./pieces";

export const BOARD_W = 10;
export const BOARD_H = 20;

// Board cells: 0 = empty, positive number = piece color index (1-7)
export type Board = number[][];

export function createBoard(): Board {
  return Array.from({ length: BOARD_H }, () => new Array(BOARD_W).fill(0));
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export interface ActivePiece {
  def: PieceDef;
  pieceIndex: number;
  rotation: number;
  x: number;
  y: number;
}

function getGrid(piece: ActivePiece): PieceGrid {
  return piece.def.rotations[piece.rotation % piece.def.rotations.length];
}

export function collides(board: Board, piece: ActivePiece): boolean {
  const grid = getGrid(piece);
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (!grid[r][c]) continue;
      const bx = piece.x + c;
      const by = piece.y + r;
      if (bx < 0 || bx >= BOARD_W || by >= BOARD_H) return true;
      if (by >= 0 && board[by][bx] !== 0) return true;
    }
  }
  return false;
}

export function lockPiece(board: Board, piece: ActivePiece): void {
  const grid = getGrid(piece);
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (!grid[r][c]) continue;
      const bx = piece.x + c;
      const by = piece.y + r;
      if (by >= 0 && by < BOARD_H && bx >= 0 && bx < BOARD_W) {
        board[by][bx] = piece.pieceIndex + 1;
      }
    }
  }
}

export function clearLines(board: Board): number {
  let cleared = 0;
  for (let r = BOARD_H - 1; r >= 0; r--) {
    if (board[r].every((c) => c !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(BOARD_W).fill(0));
      cleared++;
      r++; // recheck this row
    }
  }
  return cleared;
}

export function countHoles(board: Board): number {
  let holes = 0;
  for (let c = 0; c < BOARD_W; c++) {
    let blockFound = false;
    for (let r = 0; r < BOARD_H; r++) {
      if (board[r][c] !== 0) {
        blockFound = true;
      } else if (blockFound) {
        holes++;
      }
    }
  }
  return holes;
}

export function aggregateHeight(board: Board): number {
  let total = 0;
  for (let c = 0; c < BOARD_W; c++) {
    for (let r = 0; r < BOARD_H; r++) {
      if (board[r][c] !== 0) {
        total += BOARD_H - r;
        break;
      }
    }
  }
  return total;
}

export function bumpiness(board: Board): number {
  const heights: number[] = [];
  for (let c = 0; c < BOARD_W; c++) {
    let h = 0;
    for (let r = 0; r < BOARD_H; r++) {
      if (board[r][c] !== 0) {
        h = BOARD_H - r;
        break;
      }
    }
    heights.push(h);
  }
  let bump = 0;
  for (let i = 0; i < heights.length - 1; i++) {
    bump += Math.abs(heights[i] - heights[i + 1]);
  }
  return bump;
}

export function tryRotate(board: Board, piece: ActivePiece, dir: number): ActivePiece | null {
  const rotCount = piece.def.rotations.length;
  const newRot = ((piece.rotation + dir) % rotCount + rotCount) % rotCount;
  const candidate = { ...piece, rotation: newRot };

  // Try base position, then wall kicks
  const offsets = [0, -1, 1, -2, 2];
  for (const dx of offsets) {
    const kicked = { ...candidate, x: candidate.x + dx };
    if (!collides(board, kicked)) return kicked;
  }
  return null;
}

export function spawnPiece(pieceIndex: number, def: PieceDef): ActivePiece {
  const grid = def.rotations[0];
  return {
    def,
    pieceIndex,
    rotation: 0,
    x: Math.floor((BOARD_W - grid[0].length) / 2),
    y: -1,
  };
}

export function dropDistance(board: Board, piece: ActivePiece): number {
  let dist = 0;
  while (!collides(board, { ...piece, y: piece.y + dist + 1 })) {
    dist++;
  }
  return dist;
}
