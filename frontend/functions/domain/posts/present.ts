// The shapes sent to the browser. Tags are stored as one comma list and sent as an array.
import { type FullRow, type ListRow, type PublicRow } from './repository.ts';

export const tagsOf = (csv: string): string[] => (csv ? csv.split(',') : []);

export const toAdminPost = <T extends ListRow | FullRow>(p: T) => ({ ...p, tags: tagsOf(p.tags) });
export const toPublicPost = <T extends Pick<PublicRow, 'tags'>>(p: T) => ({ ...p, tags: tagsOf(p.tags) });
