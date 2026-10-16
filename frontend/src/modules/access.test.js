import { describe, it, expect } from 'vitest';
import { accessOf, canAccess, ACCESS } from '@/modules/auth/access';

describe('access levels', () => {
    it('maps users to levels', () => {
        expect(accessOf(null)).toBe(ACCESS.GUEST);
        expect(accessOf({ role: 'free' })).toBe(ACCESS.MEMBER);
        expect(accessOf({ role: 'admin' })).toBe(ACCESS.ADMIN);
    });
    it('only lets a level reach what is at or below it', () => {
        expect(canAccess(null, ACCESS.GUEST)).toBe(true);
        expect(canAccess(null, ACCESS.MEMBER)).toBe(false);
        expect(canAccess({ role: 'free' }, ACCESS.MEMBER)).toBe(true);
        expect(canAccess({ role: 'free' }, ACCESS.ADMIN)).toBe(false);
        expect(canAccess({ role: 'admin' }, ACCESS.MEMBER)).toBe(true);
    });
});
