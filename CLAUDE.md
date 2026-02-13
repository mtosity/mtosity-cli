# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

- **Build:** `bun run build` (runs `tsc`, outputs to `dist/`)
- **Dev:** `bun run dev` (runs `src/index.ts` directly via bun)
- **Start:** `bun run start` (runs compiled `dist/index.js`)
- **Install globally:** `bun link` (makes `mtosity` command available)

No test suite or lint script is currently configured.

## Architecture

This is a single-file interactive CLI tool (`src/index.ts`) that runs as a REPL. The binary entry point is `bin/mtosity.js` which invokes the compiled `dist/index.js`.

**REPL loop:** Uses inquirer for input, then dispatches commands via a switch statement. Commands:
- `neofetch` — system info display using `systeminformation`
- `yt <url> [start] [end]` — YouTube video download with optional FFmpeg trimming
- `yt-mp3 <url> [start] [end]` — YouTube audio download (MP3) with optional trimming
- `help`, `clear`, `exit`

**Key dependencies:**
- `youtube-dl-exec` — yt-dlp wrapper for YouTube downloads
- `fluent-ffmpeg` + `ffmpeg-static` — video/audio trimming
- `inquirer` — interactive prompts
- `ora` / `chalk` / `figlet` — terminal UI (spinners, colors, ASCII art)

**TypeScript config:** ES2022 target, CommonJS modules, strict mode. Source in `src/`, output in `dist/`.