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
    search(query) {
        if (!fuseInstance) {
            console.warn('✗ Search not initialized - click "Scan Dir" first');
            return [];
        }
        const results = fuseInstance.search(query);
        console.log(`Search for "${query}" found ${results.length} results`);
        if (results.length > 0) {
            console.log('Top 3 results:', results.slice(0, 3).map(r => r.item.name));
        }
        return results.map(result => result.item);
    }
};
