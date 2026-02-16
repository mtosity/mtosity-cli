import { enterGame, parseKey } from "../terminal";
import { PIECES } from "./pieces";
import {
  Board,
  createBoard,
  collides,
  lockPiece,
  clearLines,
  spawnPiece,
  dropDistance,
  tryRotate,
} from "./board";
import { pickWorstPiece } from "./bastard";
import { renderBoard, TetrisState } from "./renderer";
import { CommandContext } from "../../commands/registry";

const LINE_SCORES = [0, 100, 300, 500, 800];
const LINES_PER_LEVEL = 10;

function gravityMs(level: number): number {
  return Math.max(100, 800 - (level - 1) * 70);
}

export async function playTetris(cmdContext: CommandContext): Promise<void> {
  cmdContext.enterExclusiveMode();
  const ctx = enterGame();

  return new Promise<void>((resolve) => {
    const board: Board = createBoard();
    let score = 0;
    let level = 1;
    let totalLines = 0;
    let gameOver = false;

    // Spawn first piece, pre-pick next
    const firstIdx = pickWorstPiece(board);
    let active: ReturnType<typeof spawnPiece> | null = spawnPiece(firstIdx, PIECES[firstIdx]);
    let nextPieceIdx = pickWorstPiece(board);

    let gravityTimer: ReturnType<typeof setInterval> | null = null;
    let lastRender = 0;

    function getState(): TetrisState {
      return { board, active, score, level, lines: totalLines, gameOver, nextPieceIndex: nextPieceIdx };
    }

    function render() {
      const now = Date.now();
      if (now - lastRender < 16) return; // cap at ~60fps
      lastRender = now;
      renderBoard(getState());
    }

    function spawnNext() {
      active = spawnPiece(nextPieceIdx, PIECES[nextPieceIdx]);
      nextPieceIdx = pickWorstPiece(board);
      if (collides(board, active)) {
        gameOver = true;
        active = null;
        stopGravity();
        render();
      }
    }

    function lock() {
      if (!active) return;
      lockPiece(board, active);
      const cleared = clearLines(board);
      if (cleared > 0) {
        totalLines += cleared;
        score += LINE_SCORES[Math.min(cleared, 4)] * level;
        const newLevel = Math.floor(totalLines / LINES_PER_LEVEL) + 1;
        if (newLevel > level) {
          level = newLevel;
          restartGravity();
        }
      }
      spawnNext();
    }

    function tick() {
      if (!active || gameOver) return;
      const moved = { ...active, y: active.y + 1 };
      if (!collides(board, moved)) {
        active = moved;
      } else {
        lock();
      }
      render();
    }

    function startGravity() {
      gravityTimer = setInterval(tick, gravityMs(level));
    }

    function stopGravity() {
      if (gravityTimer) {
        clearInterval(gravityTimer);
        gravityTimer = null;
      }
    }

    function restartGravity() {
      stopGravity();
      startGravity();
    }

    function cleanup() {
      stopGravity();
      process.stdin.removeListener("data", onKey);
      ctx.cleanup();
      cmdContext.exitExclusiveMode();
      resolve();
    }

    function onKey(data: Buffer) {
      const key = parseKey(data);

      if (key.name === "q") {
        cleanup();
        return;
      }

      if (gameOver) return;
      if (!active) return;

      switch (key.name) {
        case "left": {
          const moved = { ...active, x: active.x - 1 };
          if (!collides(board, moved)) active = moved;
          break;
        }
        case "right": {
          const moved = { ...active, x: active.x + 1 };
          if (!collides(board, moved)) active = moved;
          break;
        }
        case "up": {
          const rotated = tryRotate(board, active, 1);
          if (rotated) active = rotated;
          break;
        }
        case "down": {
          const moved = { ...active, y: active.y + 1 };
          if (!collides(board, moved)) {
            active = moved;
            score += 1;
          }
          break;
        }
        case "space": {
          const dist = dropDistance(board, active);
          active = { ...active, y: active.y + dist };
          score += dist * 2;
          lock();
          break;
        }
      }
      render();
    }

    process.stdin.on("data", onKey);
    render();
    startGravity();
  });
}
