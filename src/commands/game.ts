import readline from "readline";
import chalk from "chalk";
import { playTetris } from "../games/tetris";
import { playInvaders } from "../games/invaders";

const GAMES: Record<string, { name: string; desc: string; play: (rl: readline.Interface) => Promise<void> }> = {
  tetris: { name: "Bastard Tetris", desc: "Tetris that always gives you the worst piece", play: playTetris },
  invaders: { name: "nInvaders", desc: "Space Invaders clone in the terminal", play: playInvaders },
};

function showGameList() {
  const cmd = chalk.cyan.bold;
  const dim = chalk.dim;

  console.log("");
  console.log(chalk.white.bold("  Available Games:"));
  console.log("");
  console.log(`    ${cmd("game tetris")}                Bastard Tetris ${dim("— always the worst piece")}`);
  console.log(`    ${cmd("game invaders")}              nInvaders ${dim("— Space Invaders clone")}`);
  console.log("");
}

export async function runGame(rl: readline.Interface, gameName?: string): Promise<void> {
  if (!gameName || !GAMES[gameName]) {
    showGameList();
    return;
  }

  await GAMES[gameName].play(rl);
}
