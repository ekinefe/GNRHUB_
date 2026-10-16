// Single source of truth for the project's name. Rename the project by changing `name`
// (and `publicUrl` once the domain moves); everything below is derived from it.
// Used by the UI, the Cloudflare function that sends e-mail, and index.html (see vite.config.js).

const name = 'GNRdigital';

export const brand = {
    name,                                   // GNRdigital
    wordmark: `${name}_`,                   // GNRdigital_   (header logo)
    version: 'v2',                          // pink tag next to the logo
    slug: name.toLowerCase(),               // gnrdigital    (terminal prompts, ids)
    prompt: `root@${name.toLowerCase()}:~`, // root@gnrdigital:~
    tagline: 'Small, reliable tools.',     // see docs/brand.md for the alternatives
    publicUrl: 'https://gnrhub.pages.dev',  // current live URL; change when the new domain is attached
};
