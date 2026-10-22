// The browser side of the admin API (ADR 0009). Same-origin only; the cookie rides along by itself.
// It returns { ok, status, data } and never throws on an HTTP error, so screens can show a message for each case.
export async function adminFetch(path, { method = 'GET', body } = {}) {
    try {
        const res = await fetch(path, {
            method,
            credentials: 'same-origin',
            headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        let data = null;
        try { data = await res.json(); } catch { /* empty or not JSON */ }
        return { ok: res.ok, status: res.status, data, retryAfter: Number(res.headers.get('Retry-After')) || 0 };
    } catch {
        return { ok: false, status: 0, data: null, retryAfter: 0 };
    }
}

/** What to tell the owner when a sign-in did not work. */
export function loginMessage({ status, retryAfter }) {
    if (status === 401) return 'Wrong username or password.';
    if (status === 429) return `Too many attempts. Try again in ${Math.max(1, Math.ceil(retryAfter / 60))} minutes.`;
    if (status === 503) return 'Sign-in is not set up yet: the admin secrets or the database are missing (see docs/admin.md).';
    if (status === 403) return 'The request was refused. Open the site from its own address and try again.';
    return 'Could not reach the server. Check your connection and try again.';
}
