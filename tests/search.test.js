import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Search } from '../src/services/Search.js';

const sampleFiles = [
    { name: 'example.txt', path: '/docs/example.txt', type: 'file' },
    { name: 'example-report.pdf', path: '/docs/example-report.pdf', type: 'file' },
    { name: 'notes.md', path: '/docs/notes.md', type: 'file' },
    { name: 'project', path: '/projects/project', type: 'directory' },
];

test('search returns [] for an empty string before initialization', () => {
    const results = Search.search('');
    assert.deepEqual(results, []);
});

test('search returns [] for a whitespace-only string before initialization', () => {
    const results = Search.search('   ');
    assert.deepEqual(results, []);
});

test('search returns [] for an empty query after initialization', () => {
    Search.init(sampleFiles);
    const results = Search.search('');
    assert.deepEqual(results, []);
});

test('search returns [] for a whitespace-only query after initialization', () => {
    Search.init(sampleFiles);
    const results = Search.search('   ');
    assert.deepEqual(results, []);
});

test('search with surrounding whitespace matches trimmed query results', () => {
    Search.init(sampleFiles);
    const trimmedResults = Search.search('example');
    const paddedResults = Search.search('  example  ');

    assert.ok(trimmedResults.length > 0, 'expected trimmed query to return results');
    assert.deepEqual(
        paddedResults.map(r => r.path),
        trimmedResults.map(r => r.path)
    );
});

test('normal nonblank search still works after initialization', () => {
    Search.init(sampleFiles);
    const results = Search.search('notes');
    assert.ok(results.some(r => r.name === 'notes.md'));
});
