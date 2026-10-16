// Feature flags, read from Vite env at build time. Unfinished features stay off so the launch has no dead ends.
//   VITE_FEATURE_ACCOUNT=true  shows login / user menu in the header
export const features = {
    account: import.meta.env.VITE_FEATURE_ACCOUNT === 'true',
};
