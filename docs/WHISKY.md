# Whisky - Run Windows Apps on macOS

Whisky is a free, user-friendly Wine wrapper for macOS that allows you to run Windows `.exe` files on Apple Silicon Macs.

## Installation

```bash
brew install --cask whisky
```

This installs:
- `Whisky.app` in `/Applications/`
- CLI tool `whisky` linked to `/opt/homebrew/bin/whisky`

## First Launch Setup

On first launch, Whisky will download required components:
- Wine (Windows compatibility layer)
- GPTK (Game Porting Toolkit components)

This may take a few minutes.

## Usage

### Creating a Bottle

A "bottle" is an isolated Windows environment (like a virtual C: drive).

1. Open Whisky
2. Click the `+` button
3. Choose settings (defaults work for most apps)
4. Click "Create"

### Running a Windows Executable

**Method 1: GUI**
- Right-click your bottle → "Run Executable..."
- Select the `.exe` file

**Method 2: Drag & Drop**
- Drag the `.exe` file onto the bottle

**Method 3: CLI**
```bash
whisky run /path/to/file.exe
```

## Alternatives (If Whisky Doesn't Work)

| Tool | Type | Cost | Notes |
|------|------|------|-------|
| CrossOver | Wine-based | $74 | Best compatibility |
| UTM | Virtual Machine | Free | Runs full Windows ARM |
| Parallels | Virtual Machine | $99/yr | Best performance |
| VMware Fusion | Virtual Machine | Free/Paid | Good compatibility |

## Troubleshooting

### App doesn't launch
- Try a different Windows version in bottle settings (Windows 10 vs 7)
- Check if the app requires specific dependencies (.NET, Visual C++)

### Graphics issues
- Enable/disable DXVK in bottle settings
- Try different renderer options

### App crashes immediately
- Some apps don't work with Wine at all
- Consider using UTM with a full Windows VM instead

## Resources

- GitHub: https://github.com/IsaacMarovitz/Whisky
- Wine AppDB (compatibility database): https://appdb.winehq.org/

## Session Notes

- Tested on: macOS (Apple Silicon / arm64)
- Successfully installed: `HarpingSetup.exe`
- Whisky version: 2.3.5
