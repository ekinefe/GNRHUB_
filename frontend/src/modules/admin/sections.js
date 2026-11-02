// The admin sections, one entry each: { path, label, element }. The shell builds its menu and routes from this list,
// so a feature adds its screen here and nothing else changes.
import React from 'react';
import AdminFeedback from './AdminFeedback';
import AdminMessages from './AdminMessages';
import AdminPosts from './AdminPosts';
import AdminProjects from './AdminProjects';
import AdminRedirects from './AdminRedirects';
import AdminVisits from './AdminVisits';

export const sections = [
    { path: 'posts', label: 'Posts', element: React.createElement(AdminPosts) },
    { path: 'projects', label: 'Portfolio', element: React.createElement(AdminProjects) },
    { path: 'redirects', label: 'Links', element: React.createElement(AdminRedirects) },
    { path: 'visits', label: 'Visits', element: React.createElement(AdminVisits) },
    { path: 'feedback', label: 'Feedback', element: React.createElement(AdminFeedback) },
    { path: 'messages', label: 'Messages', element: React.createElement(AdminMessages) },
];
