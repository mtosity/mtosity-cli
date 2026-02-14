import chalk from "chalk";
import { moveTo } from "../terminal";
import {
  InvaderState,
  INVADER_TYPES,
  FIELD_W,
  FIELD_H,
} from "./entities";

const TOP_PAD = 1;
const LEFT_PAD = 2;
const HUD_COL = FIELD_W + LEFT_PAD + 4;

function draw(row: number, col: number, str: string) {
  moveTo(TOP_PAD + row, LEFT_PAD + col);
  process.stdout.write(str);
}

function clearRow(row: number) {
  moveTo(TOP_PAD + row, LEFT_PAD);
  process.stdout.write(" ".repeat(FIELD_W + 2));
}

function drawHud(row: number, str: string) {
  moveTo(TOP_PAD + row, HUD_COL);
  process.stdout.write(str);
}

const BORDER_V = chalk.gray("║");
const BORDER_TL = chalk.gray("╔");
const BORDER_TR = chalk.gray("╗");
const BORDER_BL = chalk.gray("╚");
const BORDER_BR = chalk.gray("╝");
const BORDER_H = chalk.gray("═");

export function renderInvaders(state: InvaderState): void {
  const { invaders, playerBullet, enemyBullets, player, score, highScore, wave, frame, gameOver } = state;

  // Border
  draw(0, 0, BORDER_TL + BORDER_H.repeat(FIELD_W) + BORDER_TR);
  for (let r = 1; r <= FIELD_H; r++) {
    draw(r, 0, BORDER_V);
    draw(r, FIELD_W + 1, BORDER_V);
  }
  draw(FIELD_H + 1, 0, BORDER_BL + BORDER_H.repeat(FIELD_W) + BORDER_BR);

  // Clear play area
  for (let r = 1; r <= FIELD_H; r++) {
    moveTo(TOP_PAD + r, LEFT_PAD + 1);
    process.stdout.write(" ".repeat(FIELD_W));
  }

  // Draw invaders
  for (const inv of invaders) {
    if (!inv.alive) continue;
    const sprite = INVADER_TYPES[inv.type];
    const f = sprite.frames[frame % sprite.frames.length];
    for (let i = 0; i < f.length; i++) {
      if (inv.y + i >= 1 && inv.y + i <= FIELD_H) {
        draw(inv.y + i, inv.x + 1, sprite.color(f[i]));
      }
    }
  }

  // Draw player bullet
  if (playerBullet && playerBullet.y >= 1 && playerBullet.y <= FIELD_H) {
    draw(playerBullet.y, playerBullet.x + 1, chalk.yellow.bold("│"));
  }

  // Draw enemy bullets
  for (const b of enemyBullets) {
    if (b.y >= 1 && b.y <= FIELD_H) {
      draw(b.y, b.x + 1, chalk.red.bold("▼"));
    }
  }

  // Draw player ship
  const shipRow = FIELD_H - 1;
  if (player.lives > 0) {
    draw(shipRow - 1, player.x - 1, chalk.green.bold(" ▲ "));
    draw(shipRow,     player.x - 1, chalk.green.bold("███"));
  }

  // Ground line
  draw(FIELD_H, 1, chalk.gray.dim("─".repeat(FIELD_W)));

  // ── HUD (right side) ──
  drawHud(1, chalk.green.bold("╔══════════════════╗"));
  drawHud(2, chalk.green.bold("║") + chalk.white.bold("    nINVADERS     ") + chalk.green.bold("║"));
  drawHud(3, chalk.green.bold("╚══════════════════╝"));

  drawHud(5, chalk.gray("┌─────────────────┐"));
  drawHud(6, chalk.gray("│ ") + chalk.white("Score ") + chalk.yellow.bold(String(score).padStart(9)) + chalk.gray(" │"));
  drawHud(7, chalk.gray("│ ") + chalk.white("High  ") + chalk.rgb(255, 165, 0).bold(String(highScore).padStart(9)) + chalk.gray(" │"));
  drawHud(8, chalk.gray("│ ") + chalk.white("Wave  ") + chalk.cyan.bold(String(wave).padStart(9)) + chalk.gray(" │"));
  drawHud(9, chalk.gray("│ ") + chalk.white("Lives ") + chalk.red.bold(("♥ ".repeat(player.lives)).padStart(9)) + chalk.gray(" │"));
  drawHud(10, chalk.gray("└─────────────────┘"));

  // Invader point legend
  drawHud(12, chalk.white.bold("  Points"));
  for (let i = 0; i < INVADER_TYPES.length; i++) {
    const t = INVADER_TYPES[i];
    drawHud(13 + i, "  " + t.color(t.frames[0][0]) + chalk.gray(" = ") + chalk.white(String(t.points)));
  }

  // Controls
  drawHud(17, chalk.gray.dim("  ← →  Move"));
  drawHud(18, chalk.gray.dim(" SPACE  Shoot"));
  drawHud(19, chalk.gray.dim("   Q    Quit"));

  if (gameOver) {
    const midRow = Math.floor(FIELD_H / 2);
    const boxW = 24;
    const boxX = Math.floor((FIELD_W - boxW) / 2) + 1;

    draw(midRow - 1, boxX, chalk.bgRed(" ".repeat(boxW)));
    draw(midRow,     boxX, chalk.bgRed(chalk.white.bold("      GAME  OVER      ")));
    draw(midRow + 1, boxX, chalk.bgRed(chalk.white(`   Score: ${String(score).padStart(7)}    `)));
    draw(midRow + 2, boxX, chalk.bgRed(chalk.white("   Press Q to exit    ")));
    draw(midRow + 3, boxX, chalk.bgRed(" ".repeat(boxW)));
  }
}
