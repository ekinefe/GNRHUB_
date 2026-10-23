import React from 'react';
import { about } from '@/shared/content/about';

// Numbers from my work, from `about.results`. A "before to after" pair is a measured improvement; a single value is a count.
const HomeResults = () => (
    <section aria-labelledby="results-heading" className="py-16 border-t border-cyber-border">
        <h2 id="results-heading" className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-cyber-pink">//</span> Results so far
        </h2>
        <p className="font-mono text-cyber-muted text-sm mb-10">/work/measured</p>
        <dl className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {about.results.map(({ before, after, what }) => (
                <div key={what} className="border-l-2 border-cyber-border pl-5">
                    <dt className="font-mono text-2xl md:text-3xl font-bold text-white [overflow-wrap:anywhere]">
                        {before && <><span className="text-cyber-muted line-through decoration-cyber-border">{before}</span><span aria-label=" to " className="text-cyber-pink mx-2">&rarr;</span></>}
                        {after}
                    </dt>
                    <dd className="mt-3 font-mono text-sm text-cyber-muted leading-relaxed max-w-xs">{what}</dd>
                </div>
            ))}
        </dl>
    </section>
);

export default HomeResults;
