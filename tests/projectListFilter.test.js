import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ProjectList } from '../src/components/ProjectList.js';

// A DOM primitive stub, not a second implementation of the sidebar or filtering.
class Element {
    constructor(tag) {
        this.tagName = tag; this.children = []; this.dataset = {}; this.attributes = {};
        this.listeners = {}; this.className = ''; this.hidden = false; this.textContent = '';
        this.style = {};
        this.classList = {
            contains: value => this.className.split(' ').includes(value),
            add: value => { if (!this.classList.contains(value)) this.className += ` ${value}`; },
            remove: value => { this.className = this.className.split(' ').filter(c => c !== value).join(' '); },
        };
    }
    appendChild(child) { this.children.push(child); return child; }
    replaceChildren(...children) { this.children = children; }
    setAttribute(name, value) { this.attributes[name] = value; }
    addEventListener(name, callback) { this.listeners[name] = callback; }
    fire(name, extra = {}) { return this.listeners[name]?.({ target: this, preventDefault() {}, ...extra }); }
    focus() { document.activeElement = this; }
    querySelectorAll(selector) {
        const descendants = this.children.flatMap(child => [child, ...child.querySelectorAll('*')]);
        if (selector === '*') return descendants;
        if (selector === 'li[data-id]') return descendants.filter(c => c.tagName === 'li' && c.dataset.id);
        if (selector.startsWith('.')) return descendants.filter(c => c.classList.contains(selector.slice(1)));
        return descendants.filter(c => c.tagName === selector);
    }
}

async function fixture(projects) {
    const saved = []; const selected = [];
    globalThis.document = {
        createElement: tag => new Element(tag),
        dispatchEvent: event => selected.push(event.detail),
    };
    globalThis.window = { api: { getProjects: async () => projects, saveProject: async p => saved.push(p) } };
    const container = new Element('div');
    const component = new ProjectList(container, { open: async () => null });
    await new Promise(setImmediate);
    const names = () => container.querySelectorAll('.name').map(el => el.textContent);
    return { component, container, names, saved, selected };
}
const projects = [
    { id: 'a', name: 'Alpha', favorite: true },
    { id: 'b', name: 'Beta', favorite: false },
    { id: 'c', name: 'Alpine', favorite: false },
];

test('typing filters the real component without replacing its input or changing selection/storage', async () => {
    const f = await fixture(projects);
    const input = f.component.filterInput;
    assert.ok(input, 'actual sidebar exposes the filter control');
    assert.equal(input.attributes['aria-label'], 'Filter projects');
    input.focus(); input.value = ' al '; input.fire('input');
    assert.deepEqual(f.names(), ['Alpha', 'Alpine']);
    assert.equal(f.component.filterInput, input);
    assert.equal(document.activeElement, input);
    assert.deepEqual(f.saved, []); assert.deepEqual(f.selected, []);
    assert.equal(f.component.clearFilterButton.hidden, false);
});

test('clear, refresh and no-match states use the real component', async () => {
    const f = await fixture(projects);
    f.component.filterInput.value = 'no match'; f.component.filterInput.fire('input');
    assert.equal(f.component.emptyState.textContent, 'No projects found');
    assert.deepEqual(f.container.querySelectorAll('.section-header'), []);
    await f.component.refresh();
    assert.deepEqual(f.names(), []);
    f.component.clearFilterButton.fire('click');
    assert.deepEqual(f.names(), ['Alpha', 'Beta', 'Alpine']);
    assert.equal(f.component.filterInput.value, '');
    assert.equal(f.component.clearFilterButton.hidden, true);
});

test('favorites, selection and context menus still work after filtering', async () => {
    const f = await fixture(projects.map(p => ({ ...p })));
    f.component.filterInput.value = 'beta'; f.component.filterInput.fire('input');
    assert.deepEqual(f.container.querySelectorAll('.section-header').map(e => e.textContent), ['Projects']);
    const row = f.container.querySelectorAll('li[data-id]')[0];
    globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
    row.fire('click'); assert.equal(f.selected[0].id, 'b');
    await row.fire('click', { target: row.querySelectorAll('.star')[0] });
    assert.equal(f.saved[0].favorite, true);
    assert.deepEqual(f.container.querySelectorAll('.section-header').map(e => e.textContent), ['Favorites']);
    let menuId; f.component.showContextMenu = (_event, id) => { menuId = id; };
    f.container.querySelectorAll('li[data-id]')[0].fire('contextmenu');
    assert.equal(menuId, 'b');
});

test('project names remain text and an empty store has a distinct message', async () => {
    const f = await fixture([{ id: 'x', name: '<img src=x onerror=alert(1)>', favorite: false }]);
    assert.deepEqual(f.names(), ['<img src=x onerror=alert(1)>']);
    assert.deepEqual(f.container.querySelectorAll('img'), []);
    const empty = await fixture([]);
    assert.match(empty.component.emptyState.textContent, /No projects yet/);
    assert.equal(empty.component.emptyState.hidden, false);
});


test('Escape restores the selected project and keeps keyboard focus on the input', async () => {
    const f = await fixture(projects);
    globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
    f.container.querySelectorAll('li[data-id]').find(row => row.dataset.id === 'b').fire('click');
    f.component.filterInput.value = 'alpha'; f.component.filterInput.fire('input');
    assert.deepEqual(f.names(), ['Alpha']);
    f.component.filterInput.fire('keydown', { key: 'Escape' });
    const selected = f.container.querySelectorAll('li[data-id]').find(row => row.dataset.id === 'b');
    assert.equal(selected.classList.contains('active'), true);
    assert.equal(document.activeElement, f.component.filterInput);
    assert.equal(f.selected.length, 1);
});
