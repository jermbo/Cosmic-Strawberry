# Living Letters

**Status:** Idea
**Plugins:** CustomWiggle, CustomEase

## The idea

No timeline, no intro — a permanent idle loop that never repeats the same way.
The letters breathe, drift, and lean. They dodge the cursor. Hover too long and
they get nervous and huddle together. Sit still and they slowly relax back into
the wordmark. Leave the tab and come back to find them somewhere else.

The most charming option, and the most replayable.

## How it works

Per-letter looping timelines with `repeatRefresh: true` and `random()` values so
every cycle differs. CustomWiggle for the nervous states. A pointer-distance
falloff drives the dodge. Idle detection returns them home.

Pairs naturally as the resting state for any of the other concepts.

## Open questions

- Personality needs tuning — too much motion reads as broken, too little as bugged.
- Accessibility: this never stops moving, so reduced-motion needs a real static state.
