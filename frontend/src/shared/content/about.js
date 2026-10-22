// About page content. Edit text here; AboutMe.jsx only lays it out.
// Contact details and public URLs live in shared/config/profile.js.

// The skill groups in the order they are shown on the About page.
export const skillGroups = [
    { key: 'programming', label: 'Languages' },
    { key: 'web', label: 'Web' },
    { key: 'data', label: 'Data' },
    { key: 'testing', label: 'Testing' },
    { key: 'tools', label: 'Tools' },
    { key: 'ai', label: 'AI' },
    { key: 'hardware', label: 'Hardware' },
];

export const about = {
    name: 'Ekin Efe Gungor',
    role: 'CS Student | Junior Full-Stack Developer',
    intro: 'Web apps, internal tools and a bit of hardware. I like finding out why things break.',
    // First person on purpose: a personal brand, not a studio.
    nameStory: 'GNR comes from my surname, Gungor, and “digital” is what I make with it. This is my personal portfolio and workshop, not a studio or a company.',
    summary: 'Final-year Computer Science student (AI and Data Science, graduating June 2027) and web developer intern, working remotely. I build with Laravel, Vue and React, run my own live project on Cloudflare with CI/CD, and designed and soldered an Arduino Morse code keyer. I use Claude Code every day and test every change myself.',
    // CEFR levels as on my CV.
    languages: { Turkish: 'native', English: 'B2 to C1', Polish: 'A1, learning' },
    skills: {
        programming: ['PHP', 'JavaScript', 'TypeScript', 'Python', 'SQL', 'Bash', 'C/C++'],
        web: ['Laravel', 'Filament', 'Vue', 'Nuxt', 'React', 'Tailwind CSS', 'REST APIs'],
        data: ['MySQL', 'SQLite', 'Cloudflare D1'],
        testing: ['PHPUnit', 'Vitest', 'pytest'],
        tools: ['Git', 'GitHub Actions', 'Bitbucket', 'Jira', 'Docker', 'Cloudflare Workers', 'Linux (Fedora, Ubuntu)', 'nginx', 'systemd'],
        ai: ['Claude Code', 'OpenAI API'],
        hardware: ['Arduino', 'KiCad'],
    },
    // Each group renders as a `git log`. Newest first. `current: true` gets the highlighted node.
    log: [
        {
            key: 'education',
            title: 'EDUCATION',
            entries: [
                {
                    when: '2023 – June 2027 (expected)',
                    title: 'BSc Computer Science (AI and Data Science)',
                    org: 'Uniwersytet VIZJA, Warsaw',
                    current: true,
                },
            ],
        },
        {
            key: 'professional',
            title: 'PROFESSIONAL_EXPERIENCE',
            entries: [
                {
                    when: 'August 2026 – Present',
                    title: 'Web Developer Intern',
                    org: 'IT team, remote (company based in Istanbul)',
                    current: true,
                    points: [
                        'Delivered 40 Jira tickets and about 60 pull requests across 5 client projects (Laravel, Filament, Nuxt/Vue) in a 6-person IT team: scoped each ticket, guided the build with Claude Code, tested in the browser, and ran a 400+ test PHPUnit suite before team-lead review.',
                        'Built an employee onboarding and offboarding system that creates and removes Google Workspace, Jira, Bitbucket and Slack accounts from one admin panel. The company adopted it internally.',
                        'Upgraded the company site from Laravel 8 to 13, one major version per step. Replaced the old admin panel with Filament 5, reached zero Composer security advisories, then settled on Laravel 12 to match the production server.',
                        'Cut layout shift (CLS) on a university listing page from 0.313 to 0.006, and shrank the site’s cache from 9.9 MB to 2.7 MB (Endless Abroad).',
                        'Built an admin panel and an AI blog CMS (OpenAI text and image generation) from scratch for a foundation’s website. Cut the blog listing image payload from 2.6 MB to 92 KB.',
                        'Fixed an email header injection on a public contact form and unsafe session serialization. Caught a billing leak where test runs created paid Google accounts, and added a live/test switch.',
                    ],
                },
                {
                    when: 'December 2025 – Present',
                    title: 'IT and Data Management',
                    org: 'DYRK1A PROT Initiative',
                    current: true,
                    points: [
                        'Built the student research team’s bilingual (EN/PL) React and TypeScript website (11 pages), including event pages for a February 2026 forum at the University of Warsaw.',
                    ],
                },
            ],
        },
        {
            key: 'other',
            title: 'OTHER_EXPERIENCE',
            entries: [
                {
                    when: 'July 2024 – Present',
                    title: 'Part-time Bike Technician',
                    org: 'Benefit Bike',
                    current: true,
                    points: [
                        'Diagnose mechanical issues and complete same-day repairs; perform drivetrain/brake tuning, component replacements, and safety checks.',
                        'Communicate repair options, costs, and timelines; document work and maintain service logs.',
                        'Own the workflow end-to-end–from intake to pickup–ensuring on-time completion and QC.',
                    ],
                },
                {
                    when: 'June 2019 – Present',
                    title: 'Freelance Photographer & Technical Consultant',
                    current: true,
                    points: [
                        'Managed portrait, event, and commercial shoots end-to-end (brief, shoot, edit, delivery).',
                        'Built a terminal utility to launch common editing workflows, improving daily throughput.',
                        'Scoped requirements and advised clients on asset management and color workflows.',
                    ],
                },
                {
                    when: '2025',
                    title: 'Trainee Instructor',
                    org: 'Nobel Learning PBC',
                    points: ['Taught a beginner internet-basics course after a 90-hour training program.'],
                },
                {
                    when: 'January 2016 – December 2020',
                    title: 'Leader’s Assistant & PR/Social Media Manager',
                    org: 'Turkish Aeronautical Association',
                    points: [
                        'Led a 5-member youth team to plan national events (100+ attendees); coordinated schedules, budgets, and on-site operations.',
                        'Produced/published cross-channel social content; coordinated promo campaigns.',
                        'Liaised with local media (newspapers, radio, TV) to increase visibility and attendance.',
                    ],
                },
            ],
        },
    ],
    certificates: [
        { name: 'ChatGPT Prompt Engineering for Developers', issuer: 'DeepLearning.AI', when: 'August 2025' },
        { name: 'Fundamentals Program (90 hours)', issuer: 'Nobel Learning PBC', when: 'July 2025' },
        { name: 'Academic Skills', issuer: 'NAVOICA', when: 'January 2024' },
        { name: 'Website Development', issuer: 'NAVOICA', when: 'January 2024' },
        { name: 'Daily and Business English', issuer: 'Wyższa Szkoła Ekologii i Zarządzania w Warszawie', when: '2020 – 2021' },
    ],
};
