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

Modular CLI tool with a REPL shell. Entry point is `src/index.ts` → `src/cli.ts` (readline-based REPL with command history). Commands are in `src/commands/`, utilities in `src/utils/`.

```
src/
├── index.ts              Entry point
├── cli.ts                REPL loop & command dispatch
├── commands/
│   ├── help.ts           Help display
│   ├── system.ts         System info (neofetch-style)
│   ├── spicetify.ts      Spotify/Spicetify management
│   ├── whisky.ts         Windows app runner via Whisky
│   ├── youtube.ts        YouTube downloader
│   └── harmonica.ts      Audio enhancement
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

- **When adding, removing, or modifying any command:** Always update both `src/commands/help.ts` and `README.md` to reflect the change. Keep help text and README command tables in sync.
- **No interactive menus:** Do not use `inquirer` prompts. Commands should show usage text when called without required arguments. The REPL uses `readline` for input with arrow-key history support.
- **New commands** go in `src/commands/<name>.ts` and get wired into `src/cli.ts` switch statement.