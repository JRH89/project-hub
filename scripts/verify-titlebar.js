#!/usr/bin/env node
/**
 * Regression check for the custom title-bar controls.
 *
 * Fails (non-zero exit) if:
 *   1. Any known mojibake byte sequence is found in src/main.js, or
 *   2. Any of the three icon-only title-bar buttons (check-for-updates,
 *      minimize, close) is missing an explicit aria-label accessible name.
 *
 * This script is intentionally dependency-free so it can run in any
 * environment (CI, local dev, pre-build hooks) without extra installs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const targetFile = path.join(repoRoot, 'src', 'main.js');

function readTarget() {
    try {
        return fs.readFileSync(targetFile, 'utf8');
    } catch (err) {
        console.error(`Unable to read ${targetFile}: ${err.message}`);
        process.exit(1);
    }
}

// Known mojibake sequences that historically appeared when UTF-8 encoded
// emoji/symbols were misinterpreted as Latin-1/Windows-1252 (or vice versa).
// If any of these literal sequences reappear in the source, it indicates
// the encoding regression has crept back in.
const KNOWN_MOJIBAKE_SEQUENCES = [
    'Ã°Å¸',      // mangled emoji lead bytes (UTF-8 -> Latin-1 misread)
    'ÃƒÂ°Ã…Â¸',  // double-mangled emoji lead bytes
    'Ã¢â€',     // mangled dash/quote family
    'Ã¢Ë†â€™',   // mangled minus sign (U+2212)
    'Ã¢Å“â€”',   // mangled multiplication sign (U+00D7)
    'â€œ',       // mangled left double quote
    'â€\u009d', // mangled right double quote
    'ï¿½',        // replacement-character mojibake artifact
    'ð Ÿ',       // stray split emoji lead byte sequence with space
    'Â©',        // mangled copyright-style byte pairing (common in emoji corruption)
];

// The three icon-only title-bar controls and the accessible-name context
// they must expose via an explicit aria-label.
const REQUIRED_BUTTONS = [
    { id: 'check-updates-btn', description: 'checking for updates' },
    { id: 'minimize-btn', description: 'minimizing the window' },
    { id: 'close-btn', description: 'closing the window' },
];

function findMojibake(content) {
    return KNOWN_MOJIBAKE_SEQUENCES.filter((seq) => content.includes(seq));
}

function findMissingAccessibleNames(content) {
    const missing = [];

    for (const button of REQUIRED_BUTTONS) {
        // Locate the opening tag for the element with this id (id attribute
        // may appear before or after other attributes, in single or double
        // quotes).
        const idPattern = new RegExp(
            `<[a-zA-Z][^>]*\\bid=["']${button.id}["'][^>]*>`,
            'i'
        );
        const match = content.match(idPattern);

        if (!match) {
            missing.push({
                id: button.id,
                reason: `Could not locate an element with id="${button.id}" in ${path.relative(repoRoot, targetFile)}`,
            });
            continue;
        }

        const tag = match[0];
        const hasAriaLabel = /\baria-label=["'][^"']+["']/i.test(tag);

        if (!hasAriaLabel) {
            missing.push({
                id: button.id,
                reason: `Button #${button.id} is missing an explicit aria-label describing "${button.description}"`,
            });
        }
    }

    return missing;
}

function main() {
    const content = readTarget();
    let failed = false;

    const mojibakeHits = findMojibake(content);
    if (mojibakeHits.length > 0) {
        failed = true;
        console.error('Mojibake sequence(s) detected in title-bar source:');
        mojibakeHits.forEach((seq) => console.error(`  - ${JSON.stringify(seq)}`));
    }

    const missingNames = findMissingAccessibleNames(content);
    if (missingNames.length > 0) {
        failed = true;
        console.error('Missing accessible name(s) on title-bar control(s):');
        missingNames.forEach((entry) => console.error(`  - ${entry.reason}`));
    }

    if (failed) {
        console.error('\nTitle-bar regression check FAILED.');
        process.exit(1);
    }

    console.log('Title-bar regression check passed: no mojibake found and all accessible names present.');
    process.exit(0);
}

main();
