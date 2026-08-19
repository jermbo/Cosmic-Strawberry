# Find the Constellation

**Status:** Idea
**Plugins:** Draggable, InertiaPlugin, DrawSVGPlugin

## The idea

The sky is bigger than the window. You drag to pan across it, and COSMIC isn't
drawn for you — it's hidden out there as six real star groupings. Get close and
the connecting lines start to hint themselves in. Land on it and the whole thing
snaps together and locks.

A landing page you have to solve. Ten seconds of play, and people keep dragging
afterward just to see what else is out there.

## How it works

Extends the existing constellation work: instead of assembling on load, the
letters sit at fixed sky coordinates in a canvas/SVG world several viewports
wide. Draggable with inertia pans the world. Proximity to the target region
drives line opacity and a snap tween.

Reward the wandering — put other things out there to find.

## Open questions

- How long before someone gives up? Needs a nudge after N seconds of no progress.
- Small screens have less room to hunt.
