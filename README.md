# mtosity

An interactive CLI tool for downloading YouTube videos/audio and displaying system info.

```
  __  __   _                   _   _
 |  \/  | | |_    ___    ___  (_) | |_   _   _
 | |\/| | | __|  / _ \  / __| | | | __| | | | |
 | |  | | | |_  | (_) | \__ \ | | | |_  | |_| |
 |_|  |_|  \__|  \___/  |___/ |_|  \__|  \__, |
                                          |___/
```

## Prerequisites

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed and available in your PATH

## Install

```bash
npm install -g mtosity
```

## Usage

Run the CLI:

```bash
mtosity
```

### Commands

| Command | Description |
|---|---|
| `yt <url> [start] [end]` | Download YouTube video (MP4) |
| `yt-mp3 <url> [start] [end]` | Download YouTube audio (MP3) |
| `neofetch` | Display system information |
| `help` | Show available commands |
| `clear` | Clear the terminal |
| `exit` | Exit the CLI |

### Examples

```bash
# Download a video
yt https://youtu.be/dQw4w9WgXcQ

# Download audio only
yt-mp3 https://youtu.be/dQw4w9WgXcQ

# Download and trim (start at 0:30, duration 1:00)
yt https://youtu.be/dQw4w9WgXcQ 00:00:30 00:01:00
```

## Development

```bash
# Install dependencies
bun install

# Run in dev mode
bun run dev

# Build
bun run build
```

## License

MIT
