# Singularity

**Status:** Idea
**Plugins:** MotionPathPlugin, Physics2DPlugin

## The idea

Click anywhere and it becomes a black hole. Stars spiral in along curved paths,
the letters stretch and get eaten, the whole layout drains into a point — pause —
then it all detonates back out and re-forms.

The detonation with a real gravity well instead of a straight-line burst.

## How it works

Stars follow spiral paths computed toward the click point rather than radiating
from center; the existing warp math inverts fairly cleanly. Letters get a stretch
toward the singularity (scaleX/scaleY along the radial) before vanishing.
MotionPath for the DOM pieces, hand-rolled spiral math for the canvas stars.

## Open questions

- Does the click point matter, or does it always collapse to center?
- Overlaps with the hyperspace jump — probably these are alternates, not both.
