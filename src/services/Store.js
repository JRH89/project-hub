export const Store = {
    async getProjects() {
        return await window.api.getProjects();
    },
    async saveProject(project) {
        return await window.api.saveProject(project);
    },
    async saveProjects(projects) {
        return await window.api.saveProjects(projects);
    },
    async getIndexedFiles() {
        return await window.api.getIndexedFiles();
    },
    async saveIndexedFiles(files) {
        return await window.api.saveIndexedFiles(files);
    }
};
