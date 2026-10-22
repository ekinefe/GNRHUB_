// Single source of truth for contact details and public links. Change a URL here, not in the pages.
// Run `npm run check:links` to verify every external link in src/ still resolves.

export const profile = {
    email: 'ekinefegnr@gmail.com',
    github: 'https://github.com/ekinefe',
    linkedin: 'https://www.linkedin.com/in/ekin-efe-gungor-18336a20a/',
    repos: {
        cwKeyer: 'https://github.com/ekinefe/CW_keyer-GNR',
        cwTrainer: 'https://github.com/ekinefe/CW_trainer-GNR',
        ticketManager: 'https://github.com/ekinefe/ticket-manager',
        platform: 'https://github.com/ekinefe/GNRHUB_', // GitHub redirects automatically if the repo is renamed
    },
    // Live sites of my own projects.
    sites: { plannedLost: 'https://plannedlost.gnrdigital.workers.dev/' },
    location: { city: 'Warsaw', country: 'PL', timeZone: 'Europe/Warsaw' },
    // Shown as the badge on Home. Set open: false to hide it.
    availability: { open: true, text: 'Open to internships' },
    license: { name: 'MIT', url: 'https://github.com/ekinefe/GNRHUB_' }, // repo root: a /blob/.../LICENSE link 404s until LICENSE reaches the default branch
    dyrk1a: 'https://dyrk1aprot.com',
};
