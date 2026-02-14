# MTosity

My personal CLI, whatever I need in one place. You can use it too! You may know something about me while using it.

```
  __  __   _____                 _   _
 |  \/  | |_   _|   ___    ___  (_) | |_   _   _
 | |\/| |   | |    / _ \  / __| | | | __| | | | |
 | |  | |   | |   | (_) | \__ \ | | | |_  | |_| |
 |_|  |_|   |_|    \___/  |___/ |_|  \__|  \__, |
                                           |___/
```

## Quick Start

```bash
bunx mtosity
```

or

```bash
npx mtosity
```

## Commands

### System

| Command | Description |
|---|---|
| `system` | Display system info (OS, CPU, GPU, memory, IP addresses) |

### Apps

| Command | Description |
|---|---|
| `spotify status` | Show current Spicetify config |
| `spotify theme <name>` | Switch theme (mocha, macchiato, frappe, latte, dark, dracula, nord, gruvbox, rosepine, default) |
| `spotify apply` | Apply Spicetify config |
| `spotify restart` | Restart Spotify |
| `spotify fix` | Backup & apply (fixes after Spotify updates) |
| `spotify restore` | Restore original Spotify |
| `whisky status` | Check Whisky installation |
| `whisky run <file.exe>` | Run a Windows .exe via Whisky |
| `whisky open` | Open Whisky.app GUI |
| `whisky install` | Install Whisky via Homebrew |

### Media

| Command | Description |
|---|---|
| `yt <url> [start] [end]` | Download YouTube video (MP4) |
| `yt-mp3 <url> [start] [end]` | Download YouTube audio (MP3) |
| `harmonica <file> [preset]` | Enhance harmonica recording (presets: echo, echo-light, echo-heavy, bass) |

### General

| Command | Description |
|---|---|
| `help` | Show available commands |
| `clear` | Clear the terminal |
| `exit` | Exit the CLI |

> **Tip**: Press ↑/↓ arrows to navigate command history.

## Examples

```bash
# System info
system

# Switch Spotify theme
spotify theme mocha

# Download a video
yt https://youtu.be/dQw4w9WgXcQ

# Download and trim audio (start at 0:30, duration 1:00)
yt-mp3 https://youtu.be/dQw4w9WgXcQ 00:00:30 00:01:00

# Run a Windows exe
whisky run ~/Downloads/setup.exe

# Enhance a harmonica recording with heavy echo
harmonica recording.mp4 echo-heavy
```

## Project Structure

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

## Development

```bash
# Install dependencies
bun install

# Run in dev mode
bun run dev

# Run tests
bun test

# Build
bun run build
```

## License

MIT
