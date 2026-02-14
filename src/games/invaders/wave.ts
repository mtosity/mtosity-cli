import { Invader, INVADER_COLS, INVADER_ROWS } from "./entities";

export function createWave(waveNum: number): { invaders: Invader[]; moveDelay: number } {
  const invaders: Invader[] = [];
  const startX = 8;
  const startY = 4;
  const spacingX = 5;
  const spacingY = 3;

  for (let row = 0; row < INVADER_ROWS; row++) {
    let type: number;
    if (row === 0) type = 0;
    else if (row <= 1) type = 1;
    else type = 2;

    for (let col = 0; col < INVADER_COLS; col++) {
      invaders.push({
        x: startX + col * spacingX,
        y: startY + row * spacingY,
        type,
        alive: true,
      });
    }
  }

  // Gentler speed curve — starts slow, ramps gradually
  const baseDelay = 700;
  const moveDelay = Math.max(250, baseDelay - (waveNum - 1) * 40);

  return { invaders, moveDelay };
}

export function getAliveCount(invaders: Invader[]): number {
  return invaders.filter((i) => i.alive).length;
}

export function speedForAlive(baseDelay: number, alive: number, total: number): number {
  if (total === 0) return baseDelay;
  const ratio = alive / total;
  // Gentler speedup — minimum 120ms so it's never impossibly fast
  return Math.max(120, Math.floor(baseDelay * ratio));
}
