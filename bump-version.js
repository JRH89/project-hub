#!/usr/bin/env node

// Version bump script for Project Hub
// Automatically increments version by 0.0.1 and updates package.json

import fs from 'fs';
import path from 'path';

// Get current version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;
console.log(`Current version: ${currentVersion}`);

// Split version into parts
const versionParts = currentVersion.split('.');
const major = parseInt(versionParts[0]);
const minor = parseInt(versionParts[1]);
const patch = parseInt(versionParts[2]);

// Increment patch version
const newPatch = patch + 1;
const newVersion = `${major}.${minor}.${newPatch}`;

console.log(`New version: ${newVersion}`);

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Version updated in package.json');

// Check if PKGBUILD needs updating
const pkgbuild = fs.readFileSync('PKGBUILD', 'utf8');
if (pkgbuild.includes('pkgver=') && !pkgbuild.includes("require('./package.json').version")) {
    const updatedPkgbuild = pkgbuild.replace(/pkgver=.*/, `pkgver=${newVersion}`);
    fs.writeFileSync('PKGBUILD', updatedPkgbuild);
    console.log('Version updated in PKGBUILD');
}

console.log('\nVersion bump complete!');
console.log("Don't forget to commit and tag the new version:");
console.log(`git add package.json${pkgbuild.includes('pkgver=') && !pkgbuild.includes("require('./package.json').version") ? ' PKGBUILD' : ''}`);
console.log(`git commit -m "Bump version to ${newVersion}"`);
console.log(`git tag v${newVersion}`);
console.log('git push && git push --tags');
