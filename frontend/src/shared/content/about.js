// About page content. Edit text here; AboutMe.jsx only lays it out.
// Contact details and public URLs live in shared/config/profile.js.

export const about = {
    name: 'Ekin Efe Gungor',
    role: 'CS Student | AI & Data Science',
    intro: 'I build practical tools across web, data, and embedded systems—everything from Morse code hardware to Linux automation scripts. Currently studying AI & Data Science in Warsaw, Poland.',
    summary: 'CS student (AI and Data Science) with 3+ years of Python and Bash on Linux and hands-on embedded work (Arduino, C/C++, KiCad). I build small, reliable tools (CLI utilities and microcontroller apps) that remove manual steps and clarify workflows. Looking for opportunities to learn quickly and contribute directly by solving real problems for teams.',
    languages: { English: 'C1', Turkish: 'native', Polish: 'A1' },
    skills: {
        programming: ['Python', 'Bash', 'C/C++', 'Java', 'SQL'],
        systems: ['Linux', 'shell scripting', 'cron', 'Git/GitHub'],
        embedded: ['Arduino (C/C++)', 'microcontrollers', 'KiCad (schematics)'],
        tools: ['JetBrains/VS Code', 'Figma', 'DaVinci Resolve'],
    },
    // Each group renders as a `git log`. Newest first. `current: true` gets the highlighted node.
    log: [
        {
            key: 'education',
            title: 'EDUCATION',
            entries: [
                {
                    when: '2023 – Present (expected 2027)',
                    title: 'CS Student (AI & Data Science)',
                    org: 'Uniwersytet VIZJA w Warszawie',
                    text: 'Bachelor’s Degree in Computer Science, specialization in Artificial Intelligence and Data Science',
                    current: true,
                },
                {
                    when: '2021 – 2023',
                    title: 'Bachelor’s Degree in Computer Science',
                    org: 'Polish-Japanese Academy of Information Technology, Warsaw',
                },
            ],
        },
        {
            key: 'professional',
            title: 'PROFESSIONAL_EXPERIENCE',
            entries: [
                {
                    when: '2026 – Present',
                    title: 'IT & Data Specialist',
                    org: 'DYRK1Aprot',
                    text: 'Provides the technical backbone of the project, managing digital infrastructure and website development. He applies data science and computational methods to support the team in analyzing complex data.',
                    current: true,
                },
                {
                    when: 'January 2024 – July 2025',
                    title: 'Data Science & e-Learning Intern',
                    org: 'Nobel Learning PBC',
                    points: [
                        'Built LMS-ready modules and interactive content to enhance engagement and outcomes.',
                        'Partnered with instructors to scope features and ship prototypes for instructional tools.',
                        'Integrated modern learning tools into course workflows and wrote clear how-to docs.',
                        'Collected feedback and iterated to improve usability and content clarity.',
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
                        'Prepare/store bikes to preserve condition; organize parts/tools to reduce turnaround time.',
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

// Skills shown as a package.json block on the About page.
export const skillsPackageJson = () =>
    JSON.stringify({ name: 'ekin-efe-gungor', languages: about.languages, skills: about.skills }, null, 2)
        // keep short string arrays on one line, like a hand-written package.json
        .replace(/\[\s+([^\]]*?)\s+\]/g, (_, inner) => `[${inner.replace(/\s*\n\s*/g, ' ')}]`);
