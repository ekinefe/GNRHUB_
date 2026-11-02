import { describe, it, expect } from 'vitest'
import { initialScripts } from './check-bundle.mjs'

describe('check-bundle', () => {
  it('finds the entry script and modulepreloads, not lazy chunks', () => {
    const html = `<script type="module" crossorigin src="/assets/index-a.js"></script>
      <link rel="modulepreload" crossorigin href="/assets/vendor-react-b.js">
      <link rel="stylesheet" href="/assets/index.css">`
    expect(initialScripts(html)).toEqual(['/assets/index-a.js', '/assets/vendor-react-b.js'])
  })
})
