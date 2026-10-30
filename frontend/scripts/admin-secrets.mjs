// Makes the values for the admin secrets (ADR 0009). Run on your own machine; it prints, it does not store anything.
//   node scripts/admin-secrets.mjs hash      asks for a password (hidden) and prints ADMIN_PASSWORD_HASH
//   node scripts/admin-secrets.mjs session   prints a random SESSION_SECRET
//   node scripts/admin-secrets.mjs totp      prints a new ADMIN_TOTP_SECRET and the address to add it to an authenticator app
// Then set each one yourself:  npx wrangler secret put ADMIN_PASSWORD_HASH   (paste when asked)
import { randomBytes } from 'node:crypto'
import { hashPassword } from '../functions/domain/admin/password.ts'
import { newTotpSecret, otpauthUri } from '../functions/domain/admin/totp.ts'

export const newSessionSecret = () => randomBytes(36).toString('base64url')

function readHidden(prompt) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      let data = ''
      process.stdin.on('data', (c) => { data += c })
      process.stdin.on('end', () => resolve(data.replace(/\r?\n$/, '')))
      return
    }
    process.stderr.write(prompt)
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    let value = ''
    const onData = (ch) => {
      for (const c of ch) {
        if (c === '\r' || c === '\n' || c === '\u0004') {
          process.stdin.setRawMode(false)
          process.stdin.pause()
          process.stdin.off('data', onData)
          process.stderr.write('\n')
          return resolve(value)
        }
        if (c === '\u0003') process.exit(130)
        if (c === '\u007f') value = value.slice(0, -1)
        else value += c
      }
    }
    process.stdin.on('data', onData)
  })
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd] = process.argv.slice(2)
  if (cmd === 'session') {
    console.log(newSessionSecret())
  } else if (cmd === 'totp') {
    const secret = newTotpSecret()
    console.log(`ADMIN_TOTP_SECRET=${secret}`)
    console.log('')
    console.log('Add it to your authenticator app (Proton Authenticator, Aegis, Google Authenticator):')
    console.log('  - enter the key by hand: account "admin", issuer "GNRdigital", type time-based, 6 digits, 30 seconds; or')
    console.log('  - open this address in an app that reads otpauth links:')
    console.log(otpauthUri(secret, 'admin', 'GNRdigital'))
  } else if (cmd === 'hash') {
    const password = await readHidden('New admin password (hidden): ')
    if (password.length < 12) {
      console.error('Use at least 12 characters (a passphrase of several words is fine).')
      process.exit(1)
    }
    console.log(await hashPassword(password))
  } else {
    console.error('Usage: node scripts/admin-secrets.mjs hash | session | totp')
    process.exit(1)
  }
}
