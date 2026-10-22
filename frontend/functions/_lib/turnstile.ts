// Cloudflare Turnstile human check (GNR-133). Free. Off until TURNSTILE_SECRET is set,
// so local dev and the static launch need nothing. Public forms send the widget token
// as `cf-turnstile-response` (see src/shared/ui/TurnstileField.jsx).
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileEnv = { TURNSTILE_SECRET?: string };

export async function humanGate(
  token: string | null | undefined,
  env: TurnstileEnv,
  request?: Request,
  fetcher: typeof fetch = fetch,
): Promise<{ ok: boolean; skipped?: boolean }> {
  if (!env.TURNSTILE_SECRET) return { ok: true, skipped: true };
  if (!token) return { ok: false };

  const body = new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: token });
  const ip = request?.headers.get('CF-Connecting-IP');
  if (ip) body.set('remoteip', ip);

  try {
    const res = await fetcher(VERIFY_URL, { method: 'POST', body });
    const data = (await res.json()) as { success?: boolean };
    return { ok: data.success === true };
  } catch (error) {
    console.error('Turnstile verification failed:', error);
    return { ok: false };
  }
}

export function humanGateResponse(): Response {
  return new Response(JSON.stringify({ error: 'Human check failed.' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}
