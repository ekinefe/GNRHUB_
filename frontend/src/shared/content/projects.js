// Launch content as plain data: Home, Projects and About all read this file.
// status: 'live' (works today) | 'soon' (planned, shown as such) | 'paused' (on hold). `repo: null` means a private repo.
// Tools that are their own projects (own repo, own Worker) are listed here with `url: null` until their address
// exists; set `url` and `status: 'live'` when it does (workers.dev now, a subdomain of the portfolio domain later).
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
        name: 'GNRdigital (This Site)',
        kind: 'Platform',
        summary: 'This portfolio: React, served by a single Cloudflare Worker.',
        tech: ['React', 'Cloudflare', 'Tailwind'],
        points: [
            'A small, fast site: no cookies, no analytics, no third-party requests, with accessibility and security checks in CI.',
            'My other tools (Brandbook Maker, CV Maker) are separate projects; this site only links to them.',
        ],
        status: 'live',
        repo: profile.repos.platform,
        url: brand.publicUrl,
        image: '/projects/gnrdigital.png',
        imageAlt: 'The GNRdigital home page: availability badge, name, role, call to action, a spinning ASCII donut and a terminal bio',
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

export const toolProjects = [
    {
        id: 'brandbook-maker',
        name: 'Brandbook Maker',
        kind: 'Web app',
        summary: 'Build a brand book (colors, type, logos, voice) and save it as a PDF.',
        tech: ['React', 'Cloudflare Workers'],
        points: ['A separate project, moving to its own site.'],
        status: 'soon',
        repo: null,
        url: null,
        featured: false,
        inAbout: false,
    },
    {
        id: 'cv-maker',
        name: 'CV Maker',
        kind: 'Web app',
        summary: 'Fill in a form, pick a template and export a CV.',
        tech: ['Cloudflare Workers'],
        points: ['A separate project, planned as its own site.'],
        status: 'soon',
        repo: null,
        url: null,
        featured: false,
        inAbout: false,
    },
    {
        id: 'gym-tracker',
        name: 'Gym Tracker',
        kind: 'Web app',
        summary: 'A workout log.',
        tech: ['Cloudflare Workers'],
        points: ['On hold: good open-source trackers already exist.'],
        status: 'paused',
        repo: null,
        url: null,
        featured: false,
        inAbout: false,
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
