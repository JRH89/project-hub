export const Store = {
    async getProjects() {
        return await window.api.getProjects();
    },
    async saveProject(project) {
        return await window.api.saveProject(project);
    }
};
