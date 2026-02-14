import { PIECES, PIECE_COUNT } from "./pieces";
import {
  Board,
  BOARD_W,
  cloneBoard,
  collides,
  lockPiece,
  clearLines,
  countHoles,
  aggregateHeight,
  bumpiness,
  spawnPiece,
} from "./board";

function scorePlacement(board: Board): number {
  const holes = countHoles(board);
  const height = aggregateHeight(board);
  const bump = bumpiness(board);
  const lines = clearLines(board);
  return holes * 4 + height + bump - lines * 8;
}

/**
 * Bastard algorithm: pick the piece whose best placement still leaves
 * the worst board. For each piece type, find the best (lowest score)
 * placement. Then pick the piece type with the highest "best" score.
 */
export function pickWorstPiece(board: Board): number {
  let worstBest = -Infinity;
  let worstPieceIdx = 0;

  for (let pi = 0; pi < PIECE_COUNT; pi++) {
    const def = PIECES[pi];
    let bestScore = Infinity;

    for (let rot = 0; rot < def.rotations.length; rot++) {
      const grid = def.rotations[rot];
      const gridW = grid[0].length;

      for (let x = -(gridW - 1); x < BOARD_W; x++) {
        const piece = { def, pieceIndex: pi, rotation: rot, x, y: 0 };

        // Check if this x position is even valid at the top
        if (collides(board, piece)) continue;

        // Drop to bottom
        let dropY = 0;
        while (!collides(board, { ...piece, y: dropY + 1 })) {
          dropY++;
        }
        piece.y = dropY;

        const testBoard = cloneBoard(board);
        lockPiece(testBoard, piece);
        const score = scorePlacement(testBoard);

        if (score < bestScore) {
          bestScore = score;
        }
      }
    }

    if (bestScore === Infinity) {
      // Piece can't be placed at all — this is very bad for the player
      bestScore = 1000;
    }

    if (bestScore > worstBest) {
      worstBest = bestScore;
      worstPieceIdx = pi;
    }
  }

  return worstPieceIdx;
}
