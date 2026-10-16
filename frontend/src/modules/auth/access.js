// Three access levels, lowest to highest:
//   guest  - free, no login
//   member - free, logged in
//   admin  - owner (profiles.role === 'admin')
export const ACCESS = { GUEST: 'guest', MEMBER: 'member', ADMIN: 'admin' };

const RANK = { guest: 0, member: 1, admin: 2 };

export function accessOf(user) {
    if (!user) return ACCESS.GUEST;
    return user.role === 'admin' ? ACCESS.ADMIN : ACCESS.MEMBER;
}

export function canAccess(user, required = ACCESS.GUEST) {
    return RANK[accessOf(user)] >= RANK[required];
}
