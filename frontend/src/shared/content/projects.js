// Launch content as plain data: Home, Projects and About all read this file.
// status: 'live' (works today) | 'soon' (planned, shown as such). `repo: null` means a private repo.
// Public URLs come from shared/config/profile.js, never typed here.
// Optional per project: url (live site), image + imageAlt (screenshot in public/projects/),
// caseStudy (an internal route), learned (a short "what I learned" line, shown when present).
import { brand } from '@/shared/config/brand';
import { profile } from '@/shared/config/profile';

export const projects = [
    {
        id: 'cw-keyer',
        name: 'CW Keyer',
        kind: 'Hardware',
        summary: 'Real-time Morse code keyer built with Arduino/C++. Standalone operation with LCD & paddles.',
        tech: ['C++', 'Arduino', 'Embedded Systems'],
        points: [
            'Designed and built a hardware device from scratch to standardize Morse code transmission and reception.',
            'Developed firmware in C/C++ and designed circuitry for real-time operation with an LCD and paddles.',
        ],
        status: 'live',
        repo: profile.repos.cwKeyer,
        featured: true,
        inAbout: true,
    },
    {
        id: 'cw-trainer',
        name: 'CW Trainer (Desktop)',
        kind: 'Desktop',
        summary: 'Cross-platform training app that interfaces with the hardware keyer.',
        tech: ['C++', 'Qt6', 'Python'],
        points: [
            'Developed a cross-platform (Windows/Linux) training app to interface with the hardware keyer.',
            'Features adaptive difficulty and live performance tracking for error-free long-form text training.',
        ],
        status: 'live',
        repo: profile.repos.cwTrainer,
        featured: false,
        inAbout: false,
    },
    {
        id: 'platform',
        name: 'GNRdigital (Personal Platform)',
        kind: 'Platform',
        summary: 'Portfolio and micro-SaaS sandbox. Hosted on Cloudflare with React.',
        tech: ['React', 'Cloudflare', 'Tailwind'],
        points: [
            'Full-stack sandbox being developed into a micro-SaaS platform.',
            'Hosted on Cloudflare; sensitive API keys are kept out of the repo.',
        ],
        status: 'live',
        repo: profile.repos.platform,
        url: brand.publicUrl,
        image: '/projects/gnrdigital.png',
        imageAlt: 'The GNRdigital home page: availability badge, name, call to action and terminal bio',
        caseStudy: '/colophon',
        featured: true,
        inAbout: true,
    },
    {
        id: 'easyadmin',
        name: 'EasyAdmin',
        kind: 'CLI',
        summary: 'Bash framework automating Linux admin tasks like user management and log archiving.',
        tech: ['Bash', 'Linux Automation'],
        points: [
            'Multilingual (TR/EN/PL) CLI framework for automated headless server management.',
            'Automates user management, permissions, and log archiving for Debian-based (Ubuntu) systems.',
        ],
        status: 'live',
        repo: null,
        featured: true,
        inAbout: true,
    },
];

export const experiments = [
    { name: 'PixelART (Python)', text: 'A generative art algorithm using randomized color-flow logic for unique digital transitions.' },
    { name: 'YT Video Downloader (Python)', text: 'Terminal utility to fetch high-bitrate audio directly from YouTube servers.' },
    { name: 'Focus Timer CLI (C++)', text: 'A productivity tool utilizing the ncurses library for a functional terminal UI.' },
    { name: 'Security & Web Tools', text: 'Developed a high-entropy Password Generator (Python) and various Web Scrapers (Selenium) for automation and data practice.' },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const aboutProjects = projects.filter((p) => p.inAbout);
