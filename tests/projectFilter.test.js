import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterProjects } from '../src/services/ProjectFilter.js';

const projects = [
    { id: 'a', name: 'Alpha', favorite: true, files: ['one'] },
    { id: 'b', name: 'beta', favorite: false },
    { id: 'c', name: 'ALPINE', favorite: false },
];

for (const [query, ids] of [[' alp ', ['a', 'c']], ['BETA', ['b']], ['', ['a', 'b', 'c']], ['  ', ['a', 'b', 'c']], ['missing', []], ['<script>', []]]) {
    test(`filterProjects matches ${JSON.stringify(query)}`, () => {
        assert.deepEqual(filterProjects(projects, query).map(p => p.id), ids);
    });
}

test('filtering preserves order, object identity, favorites and source records', () => {
    const before = structuredClone(projects);
    const result = filterProjects(projects, 'a');
    assert.deepEqual(result.map(p => p.id), ['a', 'b', 'c']);
    result.forEach((p, i) => assert.equal(p, projects[i]));
    assert.deepEqual(projects, before);
});

test('missing names and null records do not crash nonempty filtering', () => {
    assert.deepEqual(filterProjects([null, {}, { name: null }, { name: 42 }, projects[0]], 'alp'), [projects[0]]);
});

test('clearing restores all projects without retaining the previous query', () => {
    assert.equal(filterProjects(projects, 'beta').length, 1);
    assert.deepEqual(filterProjects(projects, ''), projects);
});
