import { useEffect, useState } from 'react';
import { projects as builtInProjects, toolProjects as builtInTools } from './projects';

// Where the projects come from (ADR 0012): the owner's list from /api/projects (edited in the admin panel). The list built into
// the site (projects.js) is what shows until that answers, and what stays if it never does (no database yet, offline, an
// error) or the owner has not added any, so the page is never empty. One request per page load, shared by every component.
const BUILT_IN = { projects: builtInProjects, toolProjects: builtInTools };
let loaded = null; // { projects, toolProjects } from the API, once it has answered with at least one project
let pending = null;

const split = (rows) => ({ projects: rows.filter((r) => r.group !== 'tool'), toolProjects: rows.filter((r) => r.group === 'tool') });

function load() {
    pending ??= fetch('/api/projects')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
            // "managed" means the owner has projects in the database (even if all are hidden); then that list is the truth.
            if (Array.isArray(data?.projects) && (data.projects.length > 0 || data.managed === true)) loaded = split(data.projects);
            return loaded;
        })
        .catch(() => null);
    return pending;
}

// Tests start from a clean slate.
export const resetProjectsCache = () => { loaded = null; pending = null; };

export function useProjects() {
    const [lists, setLists] = useState(loaded ?? BUILT_IN);
    useEffect(() => {
        let alive = true;
        if (!loaded) load().then((result) => { if (alive && result) setLists(result); });
        return () => { alive = false; };
    }, []);
    return {
        ...lists,
        featuredProjects: lists.projects.filter((p) => p.featured),
        aboutProjects: lists.projects.filter((p) => p.inAbout),
    };
}
