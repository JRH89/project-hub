#!/usr/bin/env node
// Regression check for the title-bar controls.
//
// This script fails (non-zero exit code) if:
//   1. Any known mojibake byte sequence reappears in the title-bar markup
//      in src/main.js.
//   2. Any of the three icon-only title-bar controls (update, minimize,
//      close) is missing an explicit accessible name (aria-label).
//   3. Any of the three controls is missing its expected click behavior
//      wiring (checkForUpdates / minimizeWindow / closeWindow).
//
// It is intended to be run as part of `npm test` / `npm run build` so that
// encoding regressions are caught automatically before shipping.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mainJsPath = path.join(__dirname, '..', 'src', 'main.js');

let source;
try {
    source = fs.readFileSync(mainJsPath, 'utf8');
} catch (err) {
    console.error(`[titlebar-regression] Could not read ${mainJsPath}: ${err.message}`);
    process.exit(1);
}

const failures = [];

// 1. Known mojibake sequences that indicate broken encoding of UTF-8
// multi-byte characters (typically UTF-8 bytes mis-decoded as
// Windows-1252/Latin-1). If any of these appear literally in the source,
// something has reintroduced the encoding bug.
const knownMojibakeSequences = [
    '\u00c3\u0083', // double-encoded UTF-8 artifact
    '\u00c3\u00a2\u00e2\u201a\u00ac', // classic "â€¦" style mojibake chain
    '\u00c3\u2014', // mojibake for "×" (Ã—)
    '\u00c3\u00b0\u0178', // mojibake fragment for emoji (ðŸ...)
    '\ufffd', // Unicode replacement character - indicates corrupted bytes
    '\u00e2\u0080\u201c', // mojibake for en-dash / minus in some encodings
];

for (const seq of knownMojibakeSequences) {
    if (source.includes(seq)) {
        failures.push(`Found known mojibake sequence ${JSON.stringify(seq)} in src/main.js`);
    }
}

// 2. Extract each of the three title-bar control button tags and verify
// they carry an explicit aria-label (accessible name).
const controls = [
    { id: 'check-updates-btn', name: 'update control', apiCall: 'window.api.checkForUpdates()' },
    { id: 'minimize-btn', name: 'minimize control', apiCall: 'window.api.minimizeWindow()' },
    { id: 'close-btn', name: 'close control', apiCall: 'window.api.closeWindow()' },
];

for (const control of controls) {
    const idPattern = new RegExp(`<button[^>]*id=["']${control.id}["'][^>]*>`, 'i');
    const match = source.match(idPattern);

    if (!match) {
        failures.push(`Could not locate the ${control.name} button (#${control.id}) in src/main.js`);
        continue;
    }

    const tag = match[0];

    if (!/aria-label\s*=\s*["'][^"']+["']/i.test(tag)) {
        failures.push(`The ${control.name} button (#${control.id}) is missing an aria-label accessible name`);
    }
}

// 3. Verify click behavior wiring is preserved (either inline onclick or an
// addEventListener call referencing the expected api method).
for (const control of controls) {
    if (!source.includes(control.apiCall)) {
        failures.push(`Expected call "${control.apiCall}" for the ${control.name} was not found in src/main.js`);
    }
}

if (failures.length > 0) {
    console.error('[titlebar-regression] FAILED:');
    for (const failure of failures) {
        console.error(`  - ${failure}`);
    }
    process.exit(1);
}

console.log('[titlebar-regression] OK: title-bar controls have no mojibake and retain accessible names + click behavior.');
process.exit(0);
