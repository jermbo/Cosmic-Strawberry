# Draggable Letters

**Status:** Idea
**Plugins:** Draggable, InertiaPlugin

## The idea

Let people throw the letters. Grab one and fling it — it carries real momentum,
drifts with a slight orbital pull, bumps the viewport edges, and after a few idle
seconds sails back into formation. The site becomes a toy you fiddle with rather
than a thing you watch.

Works especially well in space, where there's no "down" to fall toward.

## How it works

`Draggable.create()` on each `.letter` group with `inertia: true`. A slow return
tween on an idle timer restores formation. Edge bounce via `bounds` plus an
`onThrowUpdate` nudge toward center.

## Open questions

- Do letters collide with each other, or just pass through?
- Interaction with the hyperspace jump — does a thrown letter survive the warp?
