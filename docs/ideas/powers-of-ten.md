# Powers of Ten

**Status:** Idea
**Plugins:** ScrollTrigger, Flip, MorphSVGPlugin

## The idea

The site opens on what looks like a galaxy. You scroll and it zooms out —
nebula becomes cluster, cluster becomes texture, texture becomes surface — and
the final pull reveals you've been staring at the skin of a strawberry the whole
time. The seeds were the stars.

One continuous scale transition, no cuts. The name stops being a cute
juxtaposition and becomes the actual reveal.

## How it works

Requires abandoning `overflow: hidden` and the single-screen hero. A pinned
ScrollTrigger drives one master timeline where scroll position maps to scale.
Each "decade" of zoom cross-fades one layer into the next so no single element
has to survive the whole range.

## Open questions

- Scroll length vs. patience — how long before the payoff?
- Needs a non-scroll path for people who never scroll (autoplay after N seconds?).
- The hardest of the ideas to make performant.
