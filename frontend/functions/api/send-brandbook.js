// Route file only: Pages maps functions/api/* to URLs, the logic lives in the module.
export { onRequestPost } from '../modules/brandbook/send.js';
export const rateLimit = { limit: 5 };
