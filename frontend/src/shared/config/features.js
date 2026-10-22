// Feature flags, read from Vite env at build time. Unfinished features stay off so the launch has no dead ends.
//   VITE_FEATURES=account,blogs   comma list of areas to switch on (default: none)
//     account    login, register and the header user menu
//     blogs      /blogs
//   VITE_FEATURE_ACCOUNT=true  legacy alias for "account"
// A flagged-off route renders the normal 404, and nothing in the UI links to it.
export const parseFeatures = (list = '', legacyAccount = '') => {
    const on = new Set(list.split(',').map((s) => s.trim()).filter(Boolean));
    return {
        account: on.has('account') || legacyAccount === 'true',
        blogs: on.has('blogs'),
    };
};

export const features = {
    ...parseFeatures(import.meta.env.VITE_FEATURES, import.meta.env.VITE_FEATURE_ACCOUNT),
};
