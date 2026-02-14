import readline from "readline";
import { enterGame, parseKey } from "../terminal";
import {
  InvaderState,
  Invader,
  FIELD_W,
  FIELD_H,
  INVADER_TYPES,
  INVADER_COLS,
  INVADER_ROWS,
  createPlayer,
} from "./entities";
import { createWave, getAliveCount, speedForAlive } from "./wave";
import { renderInvaders } from "./renderer";

const PLAYER_SPEED = 3;
const BULLET_SPEED = 2;
const ENEMY_SHOOT_CHANCE = 0.03;
const TICK_MS = 33; // ~30fps

export async function playInvaders(rl: readline.Interface): Promise<void> {
  const ctx = enterGame(rl);

  return new Promise<void>((resolve) => {
    const { invaders, moveDelay } = createWave(1);
    const totalInvaders = INVADER_COLS * INVADER_ROWS;

    const state: InvaderState = {
      invaders,
      playerBullet: null,
      enemyBullets: [],
      player: createPlayer(),
      score: 0,
      highScore: 0,
      wave: 1,
      direction: 1,
      moveTimer: 0,
      moveDelay,
      frame: 0,
      gameOver: false,
      paused: false,
    };

    let tickTimer: ReturnType<typeof setInterval> | null = null;
    let moveAccum = 0;

    // Continuous movement — keys stay held until released or opposite pressed
    const held: Set<string> = new Set();

    function cleanup() {
      if (tickTimer) clearInterval(tickTimer);
      process.stdin.removeListener("data", onKeyDown);
      ctx.cleanup();
      resolve();
    }

    function onKeyDown(data: Buffer) {
      const key = parseKey(data);

      if (key.name === "q") {
        cleanup();
        return;
      }

      if (state.gameOver) return;

      switch (key.name) {
        case "left":
          held.add("left");
          held.delete("right");
          break;
        case "right":
          held.add("right");
          held.delete("left");
          break;
        case "space":
          if (!state.playerBullet) {
            state.playerBullet = {
              x: state.player.x,
              y: FIELD_H - 3,
              dy: -BULLET_SPEED,
            };
          }
          break;
      }
    }

    function movePlayer() {
      if (held.has("left") && state.player.x > 3) {
        state.player.x -= PLAYER_SPEED;
        if (state.player.x < 3) state.player.x = 3;
      }
      if (held.has("right") && state.player.x < FIELD_W - 3) {
        state.player.x += PLAYER_SPEED;
        if (state.player.x > FIELD_W - 3) state.player.x = FIELD_W - 3;
      }
    }

    function moveBullets() {
      if (state.playerBullet) {
        state.playerBullet.y += state.playerBullet.dy;
        if (state.playerBullet.y < 1) {
          state.playerBullet = null;
        }
      }

      state.enemyBullets = state.enemyBullets.filter((b) => {
        b.y += b.dy;
        return b.y < FIELD_H;
      });
    }

    function moveInvaders() {
      const alive = state.invaders.filter((i) => i.alive);
      if (alive.length === 0) return;

      let hitEdge = false;
      for (const inv of alive) {
        const nextX = inv.x + state.direction;
        if (nextX <= 1 || nextX >= FIELD_W - 5) {
          hitEdge = true;
          break;
        }
      }

      if (hitEdge) {
        for (const inv of alive) {
          inv.y += 1;
        }
        state.direction *= -1;
      } else {
        for (const inv of alive) {
          inv.x += state.direction;
        }
      }
      state.frame = (state.frame + 1) % 2;
    }

    function enemyShoot() {
      const alive = state.invaders.filter((i) => i.alive);
      if (alive.length === 0) return;

      // Limit max enemy bullets on screen
      if (state.enemyBullets.length >= 5) return;

      const bottomInvaders: Map<number, Invader> = new Map();
      for (const inv of alive) {
        const col = inv.x;
        const existing = bottomInvaders.get(col);
        if (!existing || inv.y > existing.y) {
          bottomInvaders.set(col, inv);
        }
      }

      for (const inv of bottomInvaders.values()) {
        if (Math.random() < ENEMY_SHOOT_CHANCE) {
          state.enemyBullets.push({
            x: inv.x + 2,
            y: inv.y + 2,
            dy: 1,
          });
        }
      }
    }

    function checkCollisions() {
      // Player bullet vs invaders
      if (state.playerBullet) {
        const bx = state.playerBullet.x;
        const by = state.playerBullet.y;
        for (const inv of state.invaders) {
          if (!inv.alive) continue;
          if (bx >= inv.x && bx <= inv.x + 3 && by >= inv.y && by <= inv.y + 1) {
            inv.alive = false;
            state.playerBullet = null;
            state.score += INVADER_TYPES[inv.type].points;
            if (state.score > state.highScore) {
              state.highScore = state.score;
            }
            break;
          }
        }
      }

      // Enemy bullets vs player — forgiving hitbox
      const shipRow = FIELD_H - 1;
      state.enemyBullets = state.enemyBullets.filter((b) => {
        if (
          b.y >= shipRow - 1 &&
          b.y <= shipRow &&
          b.x >= state.player.x - 1 &&
          b.x <= state.player.x + 1
        ) {
          state.player.lives--;
          if (state.player.lives <= 0) {
            state.gameOver = true;
          }
          return false;
        }
        return true;
      });

      // Invaders reach the ground
      for (const inv of state.invaders) {
        if (inv.alive && inv.y >= FIELD_H - 3) {
          state.gameOver = true;
          break;
        }
      }
    }

    function checkWaveCleared() {
      const alive = getAliveCount(state.invaders);
      if (alive === 0) {
        state.wave++;
        const { invaders, moveDelay } = createWave(state.wave);
        state.invaders = invaders;
        state.moveDelay = moveDelay;
        state.playerBullet = null;
        state.enemyBullets = [];
        state.direction = 1;
        moveAccum = 0;
      }
    }

    function tick() {
      if (state.gameOver) {
        renderInvaders(state);
        return;
      }

      movePlayer();
      moveBullets();

      moveAccum += TICK_MS;
      const alive = getAliveCount(state.invaders);
      const currentDelay = speedForAlive(state.moveDelay, alive, totalInvaders);
      if (moveAccum >= currentDelay) {
        moveAccum = 0;
        moveInvaders();
        enemyShoot();
      }

      checkCollisions();
      checkWaveCleared();
      renderInvaders(state);
    }

    process.stdin.on("data", onKeyDown);
    renderInvaders(state);
    tickTimer = setInterval(tick, TICK_MS);
  });
}
