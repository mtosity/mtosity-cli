# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

- **Build:** `bun run build` (runs `tsc`, outputs to `dist/`)
- **Dev:** `bun run dev` (runs `src/index.ts` directly via bun)
- **Start:** `bun run start` (runs compiled `dist/index.js`)
- **Install globally:** `bun link` (makes `mtosity` command available)

- **Test:** `bun test` (runs all tests in `tests/`)

CI runs on every PR via GitHub Actions (`.github/workflows/ci.yml`).

## Architecture

Modular CLI tool with a raw-mode REPL shell. Entry point is `src/index.ts` → `src/cli.ts` (raw stdin REPL with slash commands and inline autocomplete). Commands are registered via `src/commands/registry.ts`, UI rendering via `src/ui/`.

**Argument completions:** Commands declare positional `args: ArgDefinition[]`. Each position is either a selectable dropdown (`options` array) or a non-interactive placeholder hint (no `options`). The suggestion engine (`src/ui/suggestions.ts`) resolves the current argument position and returns the appropriate suggestions. Hints are dim, wrapped in `<angle brackets>`, and cannot be selected.

```
src/
├── index.ts              Entry point
├── cli.ts                REPL loop & command dispatch
├── commands/
│   ├── registry.ts       Command registry & definitions
│   ├── help.ts           Help display (registry-driven)
│   ├── system.ts         System info (neofetch-style)
│   ├── spicetify.ts      Spotify/Spicetify management
│   ├── whisky.ts         Windows app runner via Whisky
│   ├── youtube.ts        YouTube downloader
│   ├── harmonica.ts      Audio enhancement
│   ├── clock.ts          World clock display
│   ├── weather.ts        Weather (wttr.in & Open-Meteo)
│   └── game.ts           Game launcher (tetris, invaders)
├── ui/
│   ├── renderer.ts       Terminal renderer (ANSI, scroll regions)
│   ├── input.ts          Raw stdin input handler
│   └── suggestions.ts    Autocomplete suggestion engine
├── games/
│   ├── terminal.ts       Shared game infrastructure (keys, ANSI)
│   ├── tetris/           Bastard Tetris
│   └── invaders/         Space Invaders clone
└── utils/
    ├── ffmpeg.ts          FFmpeg & yt-dlp setup
    └── network.ts         IP address utilities
```

**Key dependencies:**
- `youtube-dl-exec` — yt-dlp wrapper for YouTube downloads
- `fluent-ffmpeg` + `ffmpeg-static` — video/audio trimming
- `systeminformation` — OS/CPU/GPU/memory info
- `ora` / `chalk` / `figlet` — terminal UI (spinners, colors, ASCII art)

**TypeScript config:** ES2022 target, CommonJS modules, strict mode. Source in `src/`, output in `dist/`. Use extensionless imports (no `.js` suffixes).

## Rules

- **When adding, removing, or modifying any command:** Register it in `src/cli.ts`'s `registerAllCommands()` and update `README.md`. Help is auto-generated from the registry.
- **No interactive menus:** Do not use `inquirer` prompts. Commands should show usage text when called without required arguments. The REPL uses raw stdin with slash-command autocomplete.
- **New commands** go in `src/commands/<name>.ts` and get registered in `src/cli.ts`'s `registerAllCommands()` function via the `CommandRegistry`.
- **Sound effects must support macOS, Windows, and Linux.** Use `afplay` on macOS, PowerShell `SystemSounds`/Media on Windows, and `paplay`/`aplay` (freedesktop sounds) on Linux. Fail silently if unavailable.
