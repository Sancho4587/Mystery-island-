# Project Instructions

## Project shape
- This is a browser game built with HTML, CSS, Canvas 2D, and native JavaScript ES modules. Keep changes compatible with this stack; do not introduce a framework or dependency unless the task requires it.
- `js/main.js` owns game state, the animation loop, saving/loading, and town/home transitions.
- `js/movement.js` owns pointer-drawn player routes; `js/collision.js` owns playable bounds and obstacle checks.
- `js/town.js` and `js/home.js` contain the existing Canvas artwork.

## Preserve the game
- Preserve existing graphics, scene layouts, player controls, and gameplay behavior unless the request specifically asks to change them.
- Keep visual drawing code separate from movement and collision logic. Fix behavior at the owning logic rather than changing artwork to work around it.
- Canvas world coordinates use CSS pixels (`canvas.clientWidth` and `canvas.clientHeight`); the rendering context is scaled for device pixel ratio. Keep pointer, player, obstacle, and drawing coordinates consistent.
- When changing home transitions, preserve the town return position and the existing save/load flow. Cancel active movement routes when entering or leaving home.
- Keep changes focused and avoid unrelated refactors or new files.

## Validation and repository care
- Run `node --check` on changed JavaScript modules and `git diff --check` after edits.
- There is no configured automated test suite. When changing movement, collision, or transitions, perform a focused behavior check where practical and report any validation that could not be performed.
- Do not commit or push unless explicitly asked.
