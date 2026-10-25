# ASCII in the interface (GNR-158)

ASCII is a small system, not decoration. It appears in a few fixed places, is always `aria-hidden` (the words next to it carry the meaning), keeps the same width in every frame, and has a still version under "Reduce effects".

## Where it is allowed
| Place | What | Where in the code |
|---|---|---|
| Home | the spinning donut, the one always-moving thing | `shared/animations/AsciiDonut.jsx` |
| 404 and empty states | a terminal-style message, still | `shared/errors/NotFound.jsx`, `shared/ui/EmptyState.jsx` |
| Loading | the two patterns below | `shared/animations/` |

Never inside body copy, never behind text, never as filler.

## Loading patterns (at most three)
Both show **real state**: they are mounted only while the thing they stand for is loading and disappear the moment it is ready. Neither pretends to know how long it will take, so neither fills up on a timer.

1. **Spinner** `| / - \` (`AsciiSpinner`, `LoadingLine`): a short wait inside a line, for example "Loading posts..." on the blog and in the admin screens. Under reduced effects: a still `.`.
2. **Bar** `[====      ]` (`RouteLoading`): the full-page Suspense fallback while a page's code downloads. It stays invisible for the first 200 ms so a fast load never flashes it. The block slides back and forth because the wait is of unknown length. Under reduced effects: a still `[........................]`. Screen readers get "Loading page" at once.
3. **Reserved** for loading a separate tool later (GNR-134 and the tools that move to their own sites). Nothing uses it yet; add it here before using a third pattern anywhere else.

Frames are plain functions in `shared/animations/asciiLoading.js`, tested for constant width.

## Adding ASCII
Ask first whether a word, an icon or a skeleton does the job. If ASCII is really better, it must fit a row of the table above, be `aria-hidden`, have a still version, and be listed here.
