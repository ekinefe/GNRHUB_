import { type Row } from './repository.ts';

export const toAdminRedirect = (r: Row) => ({ id: r.id, slug: r.slug, target: r.target, permanent: r.permanent === 1, clicks: r.clicks, updatedAt: r.updatedAt });
