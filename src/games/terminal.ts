export interface GameKey {
  name: string;
  ctrl: boolean;
}

export function parseKey(data: Buffer): GameKey {
  const s = data.toString();

  if (s === "\x03") return { name: "q", ctrl: true }; // Ctrl+C → quit
  if (s === "\x1B[A") return { name: "up", ctrl: false };
  if (s === "\x1B[B") return { name: "down", ctrl: false };
  if (s === "\x1B[C") return { name: "right", ctrl: false };
  if (s === "\x1B[D") return { name: "left", ctrl: false };
  if (s === " ") return { name: "space", ctrl: false };
  if (s === "\r" || s === "\n") return { name: "enter", ctrl: false };

  return { name: s.toLowerCase(), ctrl: false };
}

export function hideCursor() {
  process.stdout.write("\x1B[?25l");
}

export function showCursor() {
  process.stdout.write("\x1B[?25h");
}

export function moveTo(row: number, col: number) {
  process.stdout.write(`\x1B[${row};${col}H`);
}

export function clearScreen() {
  process.stdout.write("\x1B[2J\x1B[1;1H");
}

export function clearLine(row: number) {
  moveTo(row, 1);
  process.stdout.write("\x1B[2K");
}

export interface GameContext {
  cleanup: () => void;
}

export function enterGame(): GameContext {
  // Raw mode is already active from the CLI's raw stdin.
  // We just need to set up the game screen.
  hideCursor();
  clearScreen();

  const cleanup = () => {
    showCursor();
    clearScreen();
  };

  return { cleanup };
}
