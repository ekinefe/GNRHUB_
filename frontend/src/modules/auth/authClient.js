// The one place the UI talks to the auth backend. Today there is none: sign-in is hidden
// behind the `account` flag and every call reports "not available". Better Auth on the
// Worker (GNR-136, GNR-61) replaces this file; callers stay the same.
const NOT_AVAILABLE = 'Sign-in is not available yet.'

const unavailable = async () => ({ error: new Error(NOT_AVAILABLE) })

export const authClient = {
    // Resolves to { user } or null.
    getSession: async () => null,
    signIn: unavailable,
    signUp: unavailable,
    signOut: async () => {},
}
