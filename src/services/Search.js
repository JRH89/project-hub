import Fuse from 'fuse.js';

let fuseInstance = null;

export const Search = {
    init(files) {
        const options = {
            keys: ['name', 'path'],
            threshold: 0.4,
        };
        fuseInstance = new Fuse(files, options);
    },
    search(query) {
        if (!fuseInstance) return [];
        return fuseInstance.search(query).map(result => result.item);
    }
};
