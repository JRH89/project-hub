#!/bin/bash

# Project Hub - Arch Linux Installation Script
# This script builds and installs Project Hub from the PKGBUILD

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on Arch Linux
if ! command -v pacman &> /dev/null; then
    print_error "This script is designed for Arch Linux systems with pacman."
    exit 1
fi

# Check if required packages are installed
print_status "Checking for required dependencies..."
missing_deps=()

if ! pacman -Q base-devel &> /dev/null; then
    missing_deps+=("base-devel")
fi

if ! pacman -Q pacman-contrib &> /dev/null; then
    missing_deps+=("pacman-contrib")
fi

if ! pacman -Q electron &> /dev/null; then
    missing_deps+=("electron")
fi

if [ ${#missing_deps[@]} -ne 0 ]; then
    print_warning "Missing dependencies: ${missing_deps[*]}"
    print_status "Installing missing dependencies..."
    sudo pacman -S --needed ${missing_deps[@]}
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    print_status "You can install them with: sudo pacman -S nodejs npm"
    exit 1
fi

# Create temporary directory for build
BUILD_DIR=$(mktemp -d)
trap "rm -rf $BUILD_DIR" EXIT

print_status "Building Project Hub in $BUILD_DIR..."

# Copy files to build directory
cp PKGBUILD "$BUILD_DIR/"
cp -r public "$BUILD_DIR/"
cp -r src "$BUILD_DIR/"
cp -r electron "$BUILD_DIR/"
cp package.json "$BUILD_DIR/"
cp index.html "$BUILD_DIR/"
cp vite.config.js "$BUILD_DIR/"

# Change to build directory
cd "$BUILD_DIR"

# Update package checksum
print_status "Updating package checksum..."
if command -v updpkgsums &> /dev/null; then
    updpkgsums
else
    print_warning "updpkgsums not found, using SKIP checksums"
    # Keep SKIP checksums for simplicity
fi

# Build the package
print_status "Building package with makepkg..."
makepkg -f

# Find the built package
PACKAGE_FILE=$(ls *.pkg.tar.zst | head -n 1)

if [ -z "$PACKAGE_FILE" ]; then
    print_error "Failed to build package."
    exit 1
fi

print_status "Package built successfully: $PACKAGE_FILE"

# Install the package
print_status "Installing Project Hub..."
sudo pacman -U "$PACKAGE_FILE"

# Verify installation
if command -v project-hub &> /dev/null; then
    print_status "Project Hub installed successfully!"
    print_status "You can now run 'project-hub' from your terminal or find it in your application menu."
    print_warning "If the app doesn't launch from the menu, try running it from terminal first to see any error messages."
else
    print_error "Installation verification failed."
    exit 1
fi

print_status "Installation complete!"
print_status "To uninstall: sudo pacman -R project-hub"
