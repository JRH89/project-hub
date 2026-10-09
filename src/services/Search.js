import Fuse from 'fuse.js';

let fuseInstance = null;

export const Search = {
    init(files) {
        const options = {
            keys: ['name', 'path'],
            threshold: 0.6, // More lenient (0 = exact, 1 = match anything)
            includeScore: true,
        };
        fuseInstance = new Fuse(files, options);
        console.log('✓ Search initialized with', files.length, 'files');
        console.log('Sample files:', files.slice(0, 5).map(f => f.name));
    },
    /**
     * Searches the initialized file index for entries matching the given query.
     *
     * The query is trimmed of surrounding whitespace before matching. If the
     * trimmed query is blank (empty or whitespace-only), or if the search
     * index has not been initialized yet via `init()`, an empty array is
     * returned.
     *
     * @param {string} query - The raw search query; leading/trailing
     *   whitespace is ignored.
     * @returns {Array<Object>} An array of matching file objects (e.g.
     *   `{ name, path, type }`) in ranked order. Note: these are the plain
     *   file objects themselves, not Fuse.js result wrappers (which would
     *   include `{ item, score, ... }`).
     */
    search(query) {
        const normalizedQuery = typeof query === 'string' ? query.trim() : '';

        if (!normalizedQuery) {
            return [];
        }

        if (!fuseInstance) {
            console.warn('✗ Search not initialized - click "Scan Dir" first');
            return [];
        }

        const results = fuseInstance.search(normalizedQuery);
        console.log(`Search for "${normalizedQuery}" found ${results.length} results`);
        if (results.length > 0) {
            console.log('Top 3 results:', results.slice(0, 3).map(r => r.item.name));
        }
        return results.map(result => result.item);
    }
};
