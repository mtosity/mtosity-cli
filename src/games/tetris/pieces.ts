import chalk from "chalk";

// Each piece has rotation states as grids (1 = filled, 0 = empty)
export type PieceGrid = number[][];

export interface PieceDef {
  name: string;
  rotations: PieceGrid[];
  color: (s: string) => string;
}

const I: PieceDef = {
  name: "I",
  rotations: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
  ],
  color: chalk.rgb(0, 240, 240),
};

const O: PieceDef = {
  name: "O",
  rotations: [
    [
      [0, 0, 0, 0],
      [0, 1, 1, 0],
      [0, 1, 1, 0],
      [0, 0, 0, 0],
    ],
  ],
  color: chalk.rgb(240, 240, 0),
};

const T: PieceDef = {
  name: "T",
  rotations: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  color: chalk.rgb(180, 0, 255),
};

const S: PieceDef = {
  name: "S",
  rotations: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
  ],
  color: chalk.rgb(0, 240, 0),
};

const Z: PieceDef = {
  name: "Z",
  rotations: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
  ],
  color: chalk.rgb(240, 0, 0),
};

const J: PieceDef = {
  name: "J",
  rotations: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  color: chalk.rgb(0, 100, 240),
};

const L: PieceDef = {
  name: "L",
  rotations: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
  color: chalk.rgb(255, 165, 0),
};

export const PIECES: PieceDef[] = [I, O, T, S, Z, J, L];
export const PIECE_COUNT = PIECES.length;
