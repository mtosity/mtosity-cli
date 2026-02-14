import chalk from "chalk";

export const FIELD_W = 56;
export const FIELD_H = 32;

export const INVADER_COLS = 9;
export const INVADER_ROWS = 4;

export interface Sprite {
  frames: string[][];
  color: (s: string) => string;
  points: number;
}

export const INVADER_TYPES: Sprite[] = [
  {
    // Top row — squid
    frames: [
      ["╔══╗", "╚╗╔╝"],
      ["╔══╗", "╔╝╚╗"],
    ],
    color: chalk.rgb(255, 80, 80),
    points: 30,
  },
  {
    // Middle rows — crab
    frames: [
      ["╠╗╔╣", " ╚╝ "],
      ["╠╝╚╣", " ╔╗ "],
    ],
    color: chalk.rgb(80, 220, 255),
    points: 20,
  },
  {
    // Bottom rows — octopus
    frames: [
      ["▄██▄", "╝╚╝╚"],
      ["▄██▄", "╗╔╗╔"],
    ],
    color: chalk.rgb(80, 255, 120),
    points: 10,
  },
];

export interface Invader {
  x: number;
  y: number;
  type: number;
  alive: boolean;
}

export interface Bullet {
  x: number;
  y: number;
  dy: number;
}

export interface Player {
  x: number;
  lives: number;
}

export interface InvaderState {
  invaders: Invader[];
  playerBullet: Bullet | null;
  enemyBullets: Bullet[];
  player: Player;
  score: number;
  highScore: number;
  wave: number;
  direction: number;
  moveTimer: number;
  moveDelay: number;
  frame: number;
  gameOver: boolean;
  paused: boolean;
}

export function createPlayer(): Player {
  return {
    x: Math.floor(FIELD_W / 2),
    lives: 5,
  };
}
