import { createContext, useContext } from 'react';

// What the admin shell shares with its screens: the numbers shown on the home page and the menu badge, and a way to
// refresh them after a screen changes something (a message read, a post saved or deleted).
export const AdminContext = createContext({ summary: null, refreshSummary: () => {} });
export const useAdmin = () => useContext(AdminContext);
