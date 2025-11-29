# Arch Linux Installation

For Arch Linux users, we provide an easy installation script that builds and installs Project Hub from source.

## Quick Install

1. Download the `project-hub-arch-*.tar.gz` file from the [latest release](https://github.com/JRH89/project-hub/releases/latest)
2. Extract and run the installation script:

```bash
tar -xzf project-hub-arch-*.tar.gz
cd project-hub-arch
./install-arch.sh
```

## Manual Installation

If you prefer to build manually:

```bash
# Install dependencies
sudo pacman -S base-devel electron nodejs npm

# Clone the repository
git clone https://github.com/JRH89/project-hub.git
cd project-hub

# Build and install
makepkg -f
sudo pacman -U project-hub-*.pkg.tar.zst
```

## Usage

After installation, you can:
- Run from terminal: `project-hub`
- Find it in your application menu under "Utility" category

## Troubleshooting

If the app doesn't launch from the menu, try running it from terminal first to see any error messages:

```bash
project-hub
```

## Uninstall

```bash
sudo pacman -R project-hub
```
