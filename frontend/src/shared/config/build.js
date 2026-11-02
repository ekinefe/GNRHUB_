// Injected by vite.config.js (define). Falls back when running outside Vite.
export const build = {
    version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0',
    sha: typeof __BUILD_SHA__ !== 'undefined' ? __BUILD_SHA__ : 'dev',
    date: typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '',
    stack: typeof __STACK__ !== 'undefined' ? __STACK__ : {},
};
