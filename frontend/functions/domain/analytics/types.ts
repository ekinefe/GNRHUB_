// First-party page counts (GNR-82): how many times each page was opened per day, and nothing else.
export const LIMITS = { path: 120, pathsPerDay: 200, keepDays: 90, window: 30, top: 10 };
export type DayCount = { day: string; views: number };
export type PageCount = { path: string; views: number };
