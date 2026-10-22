// The admin sections, one entry each: { path, label, element }. The shell builds its menu and routes from this list,
// so a feature adds its screen here and nothing else changes.
import React from 'react';
import AdminMessages from './AdminMessages';

export const sections = [
    { path: 'messages', label: 'Messages', element: React.createElement(AdminMessages) },
];
