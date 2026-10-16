// Feature flags, read from Vite env at build time. Unfinished features stay off so the launch has no dead ends.
//   VITE_FEATURE_ACCOUNT=true  shows login / user menu in the header
//   VITE_FEATURE_MAIL=true     shows "email report" in the brand book editor (server needs MAIL_ENABLED=true too)
export const features = {
    account: import.meta.env.VITE_FEATURE_ACCOUNT === 'true',
    mail: import.meta.env.VITE_FEATURE_MAIL === 'true',
};
