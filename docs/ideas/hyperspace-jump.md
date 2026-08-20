# Hyperspace Jump

**Status:** Built
**Plugins:** none (canvas + GSAP tweens)
**Files:** `src/lib/starfield.ts`, `src/lib/interactions.ts`

## The idea

Click anywhere and the starfield jumps to lightspeed. Stars stretch into radial
streaks away from center, the hero fades and scales into the blur, a white flash
covers the cut, and you re-enter on a brand-new randomly seeded sky.

## How it works

`createStarfield` holds an internal `state.warp` value that GSAP tweens 0 → 1.
While warp is above zero, each star draws as a line instead of a dot: pushed out
along its own radial from center by `warp² × distance × depth`, trailed by a
streak of proportional length. At the peak the field re-seeds, warp resets to
0.55, and eases back to 0 so the new sky decelerates into place.

The flash is a radial-gradient overlay; the intro timeline replays at the peak,
so the jump doubles as the replay trigger.

## Open questions

- No discoverability hint that clicking does anything.
- Could vary the jump: different exit vectors, occasional near-miss with a planet.
