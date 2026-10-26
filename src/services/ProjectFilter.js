/** Return matching project records in their original order without changing storage. */
export function filterProjects(projects, query) {
    const normalized = typeof query === 'string' ? query.trim().toLowerCase() : '';
    if (!normalized) return projects.slice();
    return projects.filter(project => typeof project?.name === 'string'
        && project.name.toLowerCase().includes(normalized));
}
