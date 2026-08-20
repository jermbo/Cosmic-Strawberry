# Cursor Gravity

**Status:** Idea
**Plugins:** none (canvas)

## The idea

Make the page alive on every visit, not just during the intro. Stars parallax
against the pointer by depth and bend slightly toward it, as if the cursor has
mass. The existing `.streak` element becomes a comet trail that follows fast
cursor movement and fades when you stop.

## How it works

The starfield already stores a per-star `depth` (added for the warp). Offset each
star by `pointerDelta × depth` in `draw()`, and add a falloff attraction toward
the pointer position. Cheap — no new state, no new dependencies.

## Open questions

- Touch devices have no pointer; needs a device-orientation or idle fallback.
