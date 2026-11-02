// Checking the owner's sign-in (ADR 0009, 0010). The one account's username and password hash are Worker secrets.
// Wrong username, wrong password and wrong code all take the same time and give the same result.
import { type D1 } from '../../infra/d1.ts';
import { hashPassword, verifyPassword } from './password.ts';
import { safeEqual } from './safeEqual.ts';
import { lockedFor, recordFailure } from './loginLimit.ts';
import { acceptStep, verifyTotp } from './totp.ts';

export type Credentials = { username: string; password: string; code: string };
export type Secrets = { username: string; passwordHash: string; totpSecret?: string };
export type SignInResult = { ok: true } | { ok: false; reason: 'locked'; wait: number } | { ok: false; reason: 'wrong' };

// A real hash to check against when the username is wrong, so a wrong username takes as long as a wrong password.
let dummy: Promise<string> | undefined;
const dummyHash = () => (dummy ??= hashPassword('not the password'));

/** `client` is the hashed address used by the attempt limit (see loginLimit.ts). A failure is counted against it. */
export async function checkSignIn(db: D1, secrets: Secrets, credentials: Credentials | null, client: string): Promise<SignInResult> {
  const wait = await lockedFor(db, client);
  if (wait > 0) return { ok: false, reason: 'locked', wait };

  const userOk = credentials ? await safeEqual(credentials.username, secrets.username) : false;
  const passOk = await verifyPassword(credentials?.password ?? '', userOk ? secrets.passwordHash : await dummyHash());

  // Two-factor, when a TOTP secret is set. The code is always checked, so a wrong password and a wrong code take the same time.
  let step: number | null = null;
  if (secrets.totpSecret) step = await verifyTotp(secrets.totpSecret, credentials?.code ?? '');
  const codeOk = !secrets.totpSecret || step !== null;

  // A code works once: a step that was already used (or an older one) is refused like a wrong code.
  const ok = !!credentials && userOk && passOk && codeOk && (!secrets.totpSecret || (await acceptStep(db, step as number)));
  if (!ok) {
    await recordFailure(db, client);
    return { ok: false, reason: 'wrong' };
  }
  return { ok: true };
}
