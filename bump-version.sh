#!/bin/bash

# Version bump script for Project Hub
# Automatically increments version by 0.0.1 and updates package.json

set -e

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Split version into parts
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Increment patch version
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo "New version: $NEW_VERSION"

# Update package.json
npm version $NEW_VERSION --no-git-tag-version

echo "Version updated in package.json"

# Update PKGBUILD (if it doesn't use dynamic version)
if grep -q "pkgver=" PKGBUILD && ! grep -q "require('./package.json').version" PKGBUILD; then
    sed -i "s/pkgver=.*/pkgver=$NEW_VERSION/" PKGBUILD
    echo "Version updated in PKGBUILD"
fi

echo "Version bump complete!"
echo "Don't forget to commit and tag the new version:"
echo "git add package.json PKGBUILD"
echo "git commit -m \"Bump version to $NEW_VERSION\""
echo "git tag v$NEW_VERSION"
echo "git push && git push --tags"
