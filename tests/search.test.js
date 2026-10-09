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

// --- Non-string query regression coverage ---
//
// Search.search() should gracefully return an empty array (never throw) when
// given a non-string query, regardless of whether the module has been
// initialized yet. Each "before initialization" case below imports the
// Search module fresh (via a unique cache-busting query string) so that it
// genuinely exercises the uninitialized code path, independent of any state
// mutated by other tests in this file (which share the single cached module
// instance imported at the top).

test('search returns [] for a null query before initialization (fresh module)', async () => {
    const { Search: FreshSearch } = await import('../src/services/Search.js?case=null-before');
    assert.doesNotThrow(() => {
        const results = FreshSearch.search(null);
        assert.deepEqual(results, []);
    });
});

test('search returns [] for an undefined query before initialization (fresh module)', async () => {
    const { Search: FreshSearch } = await import('../src/services/Search.js?case=undefined-before');
    assert.doesNotThrow(() => {
        const results = FreshSearch.search(undefined);
        assert.deepEqual(results, []);
    });
});

test('search returns [] for a numeric query before initialization (fresh module)', async () => {
    const { Search: FreshSearch } = await import('../src/services/Search.js?case=number-before');
    assert.doesNotThrow(() => {
        const results = FreshSearch.search(42);
        assert.deepEqual(results, []);
    });
});

test('search returns [] for an object query before initialization (fresh module)', async () => {
    const { Search: FreshSearch } = await import('../src/services/Search.js?case=object-before');
    assert.doesNotThrow(() => {
        const results = FreshSearch.search({ not: 'a string' });
        assert.deepEqual(results, []);
    });
});

test('search returns [] for a null query after initialization', () => {
    Search.init(sampleFiles);
    assert.doesNotThrow(() => {
        const results = Search.search(null);
        assert.deepEqual(results, []);
    });
});

test('search returns [] for an undefined query after initialization', () => {
    Search.init(sampleFiles);
    assert.doesNotThrow(() => {
        const results = Search.search(undefined);
        assert.deepEqual(results, []);
    });
});

test('search returns [] for a numeric query after initialization', () => {
    Search.init(sampleFiles);
    assert.doesNotThrow(() => {
        const results = Search.search(42);
        assert.deepEqual(results, []);
    });
});

test('search returns [] for an object query after initialization', () => {
    Search.init(sampleFiles);
    assert.doesNotThrow(() => {
        const results = Search.search({ not: 'a string' });
        assert.deepEqual(results, []);
    });
});
