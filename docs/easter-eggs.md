# Easter eggs

Small hidden things (GNR-58). Every one is harmless, can be ended with Esc, and is off under "Reduce effects" or the OS reduced-motion setting.

| Egg | How to find it | Where it lives |
|---|---|---|
| Matrix rain | Konami code (up up down down left right left right B A) anywhere outside a text field. Lasts 5 seconds; Esc or a click ends it. | `shared/animations/MatrixRain.jsx`, started in `shared/layout/CommandPalette.jsx` |
| `help`, `whoami`, `sudo`, `coffee` | Open the command palette (Ctrl/Cmd+K) and type the word. | `shared/commands/commands.js` |
| Fake terminal on 404 | Visit a route that does not exist. | `shared/errors` |
| Scanlines | Palette command `scanlines` (a visitor choice, off by default). | `shared/config/theme.js` |

Adding one: keep it decorative (`aria-hidden`), ask `effectsReduced()` first, and add a row here.
