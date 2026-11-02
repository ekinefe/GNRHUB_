import { type FeedbackRow } from './repository.ts';

export const toFeedback = (f: FeedbackRow) => ({ ...f, read: f.readAt !== null });
