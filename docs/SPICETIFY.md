# Spicetify Guide

A comprehensive guide for installing, configuring, and customizing Spotify with Spicetify.

## Table of Contents

- [Installation](#installation)
- [Initial Setup](#initial-setup)
- [Configuration](#configuration)
- [Extensions](#extensions)
- [Themes](#themes)
- [Marketplace](#marketplace)
- [Ad Blocking](#ad-blocking)
- [Useful Commands](#useful-commands)
- [Troubleshooting](#troubleshooting)

---

## Installation

### macOS (Homebrew)

```bash
brew install spicetify-cli
```

### macOS/Linux (Shell Script)

```bash
curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh
```

### After Installation

Add Spicetify to your PATH by adding this line to `~/.zshrc` or `~/.bashrc`:

```bash
export PATH="$HOME/.spicetify:$PATH"
```

Then reload your shell:

```bash
source ~/.zshrc  # or source ~/.bashrc
```

---

## Initial Setup

After installing Spicetify, you must backup and apply before using:

```bash
spicetify backup apply
```

This will:
1. Create a backup of your Spotify installation
2. Apply Spicetify's modifications to Spotify

**Important:** Restart Spotify after running this command.

---

## Configuration

### View Current Config

```bash
spicetify config
```

### Key Configuration Options

| Option | Description |
|--------|-------------|
| `current_theme` | Active theme name |
| `color_scheme` | Color scheme within the theme |
| `inject_css` | Enable CSS injection (1/0) |
| `inject_theme_js` | Enable theme JavaScript (1/0) |
| `replace_colors` | Enable color replacement (1/0) |
| `overwrite_assets` | Overwrite Spotify assets (1/0) |

### Set Configuration

```bash
spicetify config <option> <value>
spicetify apply
```

Example:

```bash
spicetify config current_theme Dribbblish color_scheme nord-dark
spicetify apply
```

### Recommended Settings for Themes

```bash
spicetify config inject_css 1 replace_colors 1 overwrite_assets 1 inject_theme_js 1
spicetify apply
```

---

## Extensions

### Spicetify Directory Structure

```
~/.spicetify/
├── Extensions/       # JavaScript extensions
├── Themes/           # Theme folders
├── CustomApps/       # Custom applications
└── spicetify         # CLI binary
```

### Built-in Extensions

Located in `~/.spicetify/Extensions/`:

| Extension | Description |
|-----------|-------------|
| `shuffle+.js` | True shuffle algorithm |
| `keyboardShortcut.js` | Additional keyboard controls |
| `fullAppDisplay.js` | Full-screen album art display |
| `bookmark.js` | Bookmark tracks and albums |
| `trashbin.js` | Quick track removal from playlists |
| `loopyLoop.js` | Loop sections of tracks |
| `popupLyrics.js` | Popup lyrics display |
| `autoSkipExplicit.js` | Auto-skip explicit content |
| `autoSkipVideo.js` | Auto-skip video podcasts |

### Enable Extensions

```bash
# Enable single extension
spicetify config extensions <extension.js>

# Enable multiple extensions
spicetify config extensions "shuffle+.js|keyboardShortcut.js|fullAppDisplay.js"

# Apply changes
spicetify apply
```

### Disable Extensions

```bash
# Remove extension (note the minus sign)
spicetify config extensions <extension.js>-
spicetify apply
```

---

## Themes

### Theme Location

Themes are stored in `~/.spicetify/Themes/`

Each theme folder typically contains:
- `color.ini` - Color definitions
- `user.css` - CSS styles
- `theme.js` (optional) - Theme JavaScript

### Installing Community Themes

Clone the official themes repository:

```bash
cd ~/.spicetify/Themes
git clone --depth=1 https://github.com/spicetify/spicetify-themes.git
```

### Installing Individual Themes

#### Comfy Theme

```bash
git clone --depth=1 https://github.com/Comfy-Themes/Spicetify.git ~/.spicetify/Themes/Comfy
cd ~/.spicetify/Themes/Comfy
mv Comfy/* . 2>/dev/null
spicetify config current_theme Comfy color_scheme Comfy
spicetify apply
```

#### Catppuccin Theme

```bash
git clone --depth=1 https://github.com/catppuccin/spicetify.git ~/.spicetify/Themes/catppuccin
cd ~/.spicetify/Themes/catppuccin
cp -r catppuccin/* .
spicetify config current_theme catppuccin color_scheme mocha
spicetify apply
```

Available Catppuccin flavors: `mocha`, `macchiato`, `frappe`, `latte`

#### Dribbblish Theme

```bash
# If using community themes repo
spicetify config current_theme Dribbblish color_scheme base
spicetify apply
```

Available Dribbblish schemes: `base`, `white`, `dark`, `dracula`, `nord-dark`, `nord-light`, `beach-sunset`, `purple`, `samurai`, `gruvbox`, `rosepine`, `lunar`

### Apply a Theme

```bash
spicetify config current_theme <ThemeName>
spicetify config color_scheme <SchemeName>
spicetify apply
```

### Switch Color Scheme

```bash
spicetify config color_scheme <scheme>
spicetify apply
```

---

## Marketplace

The Marketplace allows browsing and installing themes/extensions directly within Spotify.

### Install Marketplace

```bash
spicetify config custom_apps marketplace
spicetify apply
```

### Using Marketplace

1. Restart Spotify after installation
2. Find "Marketplace" in the sidebar
3. Browse themes, extensions, and snippets
4. Click "Install" on any item
5. Select "Reload now" to apply

---

## Ad Blocking

### Install Ad Blocker Extension

```bash
# Download adblock extension (ririxi version - more effective)
curl -fsSL https://raw.githubusercontent.com/rxri/spicetify-extensions/main/adblock/adblock.js \
  -o ~/.spicetify/Extensions/adblock.js

# Enable it
spicetify config extensions adblock.js
spicetify apply
```

### Performance Optimizations

These settings disable telemetry and logging:

```bash
spicetify config disable_sentry 1
spicetify config disable_ui_logging 1
spicetify apply
```

**Note:** Using ad blockers may violate Spotify's Terms of Service.

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `spicetify backup` | Backup Spotify installation |
| `spicetify apply` | Apply current configuration |
| `spicetify update` | Update Spicetify CLI |
| `spicetify restore` | Restore Spotify to original state |
| `spicetify config` | View all configuration |
| `spicetify path` | Show Spicetify directory path |
| `spicetify --version` | Show version |

### Quick Setup Command

Enable popular extensions in one command:

```bash
spicetify config extensions "shuffle+.js|keyboardShortcut.js|fullAppDisplay.js|bookmark.js|trashbin.js"
spicetify config custom_apps marketplace
spicetify config disable_sentry 1 disable_ui_logging 1
spicetify apply
```

---

## Troubleshooting

### "Command not found: spicetify"

Add to PATH:

```bash
echo 'export PATH="$HOME/.spicetify:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Or run directly:

```bash
~/.spicetify/spicetify <command>
```

### "You haven't backed up"

Run the initial backup:

```bash
spicetify backup apply
```

### Theme Not Applying

1. Ensure all required settings are enabled:
   ```bash
   spicetify config inject_css 1 replace_colors 1 inject_theme_js 1
   spicetify apply
   ```

2. Restart Spotify completely (quit and reopen)

### Spotify Updated and Broke Spicetify

Re-apply after Spotify updates:

```bash
spicetify backup apply
```

### Reset Everything

Restore Spotify to original state:

```bash
spicetify restore
```

### Extension Not Found Error

If you see "Extension X not found":

```bash
# Remove the missing extension
spicetify config extensions <extension.js>-
spicetify apply
```

### Extensions Not Working / Config Issues

Extensions are stored in `~/.spicetify/Extensions/`, NOT `~/.config/spicetify/Extensions/`.

If the CLI behaves unexpectedly when configuring extensions, edit the config file directly:

```bash
# Config file location
~/.config/spicetify/config-xpui.ini

# Extensions format (pipe-separated)
extensions = adblock.js|shuffle+.js|keyboardShortcut.js
```

After editing, run:

```bash
spicetify apply
pkill -x Spotify && open -a Spotify  # Restart Spotify
```

---

## Popular Theme Repositories

| Theme | Repository |
|-------|------------|
| Community Themes | https://github.com/spicetify/spicetify-themes |
| Comfy | https://github.com/Comfy-Themes/Spicetify |
| Catppuccin | https://github.com/catppuccin/spicetify |
| Fluent | https://github.com/williamckha/spicetify-fluent |
| Bloom | https://github.com/nimsandu/spicetify-bloom |

---

## Resources

- **Official Documentation:** https://spicetify.app
- **GitHub CLI:** https://github.com/spicetify/cli
- **Marketplace:** https://github.com/spicetify/marketplace
- **Community Themes:** https://github.com/spicetify/spicetify-themes
