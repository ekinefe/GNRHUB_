import { type MessageRow, type RecentRow } from './repository.ts';

export const toMessage = (m: MessageRow) => ({ ...m, read: m.readAt !== null });
export const toRecent = (m: RecentRow) => ({ ...m, read: m.read === 1 });
