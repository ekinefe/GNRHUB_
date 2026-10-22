import { projects } from '@/shared/content/projects';

// Names of the projects whose tech list mentions a skill (words of 3+ letters, so "C/C++" matches "C++").
export function projectsUsing(skill, list = projects) {
    const words = skill.toLowerCase().split(/[\s/()]+/).filter((w) => w.length >= 3);
    return list.filter((p) => p.tech.some((t) => words.some((w) => t.toLowerCase().includes(w)))).map((p) => p.name);
}
