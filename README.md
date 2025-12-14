# Project Hub

A lightweight desktop application to organize complex projects with scattered files.

## Installation

### Windows
Download the latest release from the [Releases page](https://github.com/jrh89/project-hub/releases):
- **Installer**: `Project-Hub-Setup-1.0.0.exe` (recommended)
- **Portable**: `Project-Hub-1.0.0.exe` (no installation required)

### Linux

#### AppImage (Universal)
```bash
# Download from releases
chmod +x Project-Hub-*.AppImage
./Project-Hub-*.AppImage
```

#### Debian/Ubuntu
```bash
sudo dpkg -i project-hub_1.0.0_amd64.deb
```

#### Fedora/RHEL
```bash
sudo rpm -i project-hub-1.0.0.x86_64.rpm
```

#### Arch Linux (AUR)
```bash
# Clone the PKGBUILD
git clone https://github.com/yourusername/project-hub.git
cd project-hub
makepkg -si

# Or use an AUR helper
yay -S project-hub
```

## Development

```bash
npm install
npm run dev
```

## Building

### For Windows
```bash
npm run package:win
```

This creates:
- NSIS installer (`.exe`)
- Portable executable

### For Linux
```bash
npm run package:linux
```

This creates:
- AppImage (universal)
- `.deb` (Ubuntu/Debian)
- `.rpm` (Fedora/RHEL/Arch)

### For All Platforms
```bash
npm run package
```

Built packages will be in the `release/` directory.

## Publishing Releases

To create a new release:

1. Update version in `package.json`
2. Commit changes
3. Create and push a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. GitHub Actions will automatically build and publish the release

## Tech Stack

- Electron
- Vite
- Vanilla JavaScript
- Fuse.js (fuzzy search)
- electron-store (data persistence)

## License

MIT

