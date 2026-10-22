// D1 helper behind the db:* npm scripts (ADR 0009). Local commands touch only .wrangler/.
// The remote command refuses to run until you type the database name, and never without a terminal.
import { spawnSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'

const CONFIG = 'wrangler.jsonc'
export const DATABASE = 'gnrdigital'

const run = (args) => {
  const r = spawnSync('npx', ['wrangler', ...args, '--config', CONFIG], { stdio: 'inherit' })
  process.exit(r.status ?? 1)
}

const confirm = async (name) => {
  if (!process.stdin.isTTY) {
    console.error(`Refusing a remote change without a terminal. Run it yourself and type "${name}".`)
    process.exit(1)
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await rl.question(`This changes the REMOTE database "${name}". Type its name to continue: `)
  rl.close()
  if (answer.trim() !== name) {
    console.error('Name did not match. Nothing was changed.')
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [target, ...rest] = process.argv.slice(2)
  switch (target) {
    case 'migrate-local':
      run(['d1', 'migrations', 'apply', 'DB', '--local'])
      break
    case 'migrate-remote':
      await confirm(DATABASE)
      run(['d1', 'migrations', 'apply', 'DB', '--remote'])
      break
    case 'query-local':
      if (!rest[0]) {
        console.error('Usage: npm run db:query:local -- "SELECT 1"')
        process.exit(1)
      }
      run(['d1', 'execute', 'DB', '--local', '--command', rest[0]])
      break
    default:
      console.error('Unknown db command:', target)
      process.exit(1)
  }
}
