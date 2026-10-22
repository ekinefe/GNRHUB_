import React from 'react';
import { Link } from 'react-router-dom';
import { about } from '@/shared/content/about';
import { projectsUsing } from './projectsUsing';

// The skills from the About data, grouped, each with the projects whose tech list mentions it.
// Nothing here is typed twice: add a skill in about.js or a tech tag in projects.js and this follows.
const GROUPS = [
    { key: 'programming', label: 'Languages' },
    { key: 'web', label: 'Web' },
    { key: 'tools', label: 'Tools' },
];

const SkillsStrip = () => (
    <section aria-labelledby="skills-heading" className="py-16 border-t border-cyber-border">
        <h2 id="skills-heading" className="text-2xl font-bold text-white mb-10 flex items-center gap-2">
            <span className="text-cyber-pink">//</span> What I work with
        </h2>
        <div className="grid gap-10 md:grid-cols-3">
            {GROUPS.map(({ key, label }) => (
                <div key={key}>
                    <h3 className="font-mono text-sm text-cyber-cyan mb-4">{label}</h3>
                    <ul className="space-y-3 font-mono text-sm">
                        {about.skills[key].map((skill) => {
                            const used = projectsUsing(skill);
                            return (
                                <li key={skill}>
                                    <span className="text-cyber-text">{skill}</span>
                                    {used.length > 0 && (
                                        <Link to="/projects" className="block text-xs text-cyber-muted hover:text-cyber-pink transition-colors">
                                            used in {used.join(', ')}
                                        </Link>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </div>
    </section>
);

export default SkillsStrip;
