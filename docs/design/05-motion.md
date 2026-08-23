# 05 — Motion

**Source of truth:** `src/lib/proto/reveal.ts`, `cursor.ts`, `theme.ts`, `hub/boot.ts`
**Live:** [`/proto/kit`](../../src/pages/proto/kit.astro) § 06, with a replay control

## Principles

### Things assemble; they do not appear

A fade is an object arriving with no explanation. Every reveal here is a
construction: strokes draw along their own path, stripe segments land in
sequence, headlines rise out of a mask, rules scale from their left edge. A
technical drawing that draws itself is the motif and the motion agreeing with
each other.

### One direction, and it is the reading direction

Left to right, top to bottom. Nothing arrives from the right, nothing rises from
below the fold to overshoot, nothing rotates in.

### Nothing bounces, scales, or blurs

No `back` or `elastic` easing anywhere. The easing set is `expo.out`,
`power4.out`, `power3.out`, `power2.inOut`, `power3.inOut`, `none`. Motion
decelerates into place and stops — the way a plotter arm does.

The one exception is `steps()`, used only by the hub deck's signal lock. A
dropped frame reads as a fault; a smooth slide reads as decoration. If something
is meant to look broken for 140ms it must not ease.

### Sequence over duration

Almost everything is fast (0.4–1.05s). The feeling of deliberateness comes from
stagger, not from slow tweens. Nine moves, and seven of them are staggered.

### Reveal once

Every scroll reveal is `once: true`. Nothing re-animates on scroll-back —
re-animation is the fastest way to make a considered page feel like a demo.

### Reduced motion is a designed state, not a fallback

Under `prefers-reduced-motion: reduce`, elements are placed in their final state
at paint: stripes set, rules at full width, callouts all lit, custom cursor off,
transitions clamped to 0.001ms. Nothing is left hidden waiting for a trigger
that will never fire — the whole reveal system starts from `opacity: 0`, so
this is a correctness requirement, not a nicety.

## The nine moves

| Move | Mechanism | From → to | Duration | Ease | Stagger |
|------|-----------|-----------|----------|------|---------|
| Wordmark | SplitText lines, masked | `yPercent 112 → 0` | 1.05s | `expo.out` | 0.085s |
| Stripe assemble | `scaleX` per segment, origin left | `0 → 1` | 0.62s | `power4.out` | 0.085s |
| Line-work draw | DrawSVG on every `.ln` | `0% 0% → 0% 100%` | 0.85s | `power2.inOut` | 0.035s |
| Annotation fade | `.txt` and fills, behind the strokes | `opacity 0 → 1` | 0.40s | `none` | 0.02s |
| Hairline rule | `scaleX`, origin left | `0 → 1` | 0.90s | `expo.out` | — |
| Copy block | opacity + y | `y 16 → 0` | 0.80s | `power3.out` | — |
| Group stagger | cards, method steps | `y 22 → 0` | 0.85s | `power3.out` | 0.09s |
| Theme wipe | 3 bands, out then back | `scaleX 0 → 1 → 0` | 0.42s ×2 | `power3.inOut` | 0.055s |
| Cursor follow | `gsap.quickTo` on x/y | pointer position | 0.22s | `power3.out` | — |

Shared easing token: `--ease: cubic-bezier(0.22, 1, 0.36, 1)` for CSS-side
transitions (hover states, the toggle knob, cursor shape changes).

**SplitText hands back the accessible name.** The mask wrappers carry
`aria-hidden="true"`, so a masked `<h1>` announces as an empty level-1 heading.
`maskLines()` captures the name before the split and pins it back on with
`aria-label`. Separate the child spans with whitespace in the markup, or
`textContent` runs the words together ("CosmicStrawberry").

**DrawSVG hands back its properties.** The draw works by writing
`stroke-dasharray` and `stroke-dashoffset` inline, which outrank the stylesheet
— so a drawn `.ln--dash` finishes *solid* and every centreline and construction
line quietly stops reading as one. `drawFigure()` clears both props on complete
so CSS takes the dash pattern back. Any future stroke effect that touches those
properties owes the same courtesy.

## Hero load sequence

One timeline, `playHero()`, fired after `document.fonts.ready` so nothing
animates against a fallback face and reflows.

```
0.05s  mono meta lines fade up, 0.06s apart
0.12s  hairline rule scales from left
0.18s  wordmark lines rise out of mask, 0.085s apart
0.42s  hero figure begins drawing itself
0.52s  stripe segments land, 0.085s apart
0.70s  lede and spec blocks fade up, 0.07s apart
```

The figure starts drawing *before* the stripe lands, so the two are on screen
together — the page is being drafted, not listed.

## Deck load sequence — hub option 06

The hub deck is fixed and never scrolls, so it cannot express its load as a
hero timeline plus scroll triggers. It runs `motion="manual"` on the layout,
which brings up theme and cursor and then leaves the page alone, and owns the
whole sequence in `src/lib/proto/hub/boot.ts`.

Two beats, deliberately overlapped so the whole thing is ~1.75s rather than
two sequential loads:

```
REGISTER
0.00s  world descends 30% of a viewport into the frame        1.20s expo.out
0.00s  ghost word slides in from the left                     1.40s expo.out
0.06s  section rail and down-affordance land, 0.05s apart     0.60s power4.out
0.20s  progress stripe assembles, 0.085s apart                0.62s power4.out

SIGNAL LOCK
0.30s  scanline crosses the deck, top to bottom, fading       0.45s none
0.30s  whole masthead displaces 5px and corrects              0.14s steps(3)

DRAFT
0.40s  mono meta lines fade up, 0.06s apart                   0.50s power4.out
0.40s  ...and resolve out of noise, same stagger              0.60s scrambleText
0.46s  hairline rule scales from left                         0.95s expo.out
0.52s  wordmark lines rise out of mask, 0.085s apart          1.05s expo.out
0.76s  core section begins drawing itself                     0.85s power2.inOut
0.86s  stripe segments land, 0.085s apart                     0.62s power4.out
0.92s  stripe off register by 4px, corrected                  0.16s steps(2)
1.04s  lede and spec table fade up, 0.07s apart               0.70s power4.out
1.06s  figure caption fades in behind its drawing             0.50s none
```

**Why the world moves first.** The register is the deck's own gesture,
performed once before anyone has touched it. It is the only part of the load
that teaches the interaction: this surface translates, it does not scroll. The
travel is downward — content descending into the frame, never rising over the
fold — and it is deliberately a third of a viewport rather than a full row, so
the Projects cells are never flashed on the way past.

**Why there is a glitch at all, and why only here.** The masthead claims `SIG ◉
LOCKED`, so the load earns it: one scanline, one hard displacement, and the mono
readouts resolving out of noise. `SIG ◉ LOCKED` is the third and last meta line,
so the lock is literally the last thing to resolve — which is the only order
that means anything. This is the single place the "nothing plays on a timer"
rule is spent, and it is spent on a *transition*: it happens once, on arrival,
and can never happen again. A permanent scanline is wallpaper you stop seeing on
the second visit; that would be the `cold-boot` pivot, not this.

**Why the masthead drafts second.** Row 00 *is* the index hero, so it gets the
index hero's vocabulary: rule from the left, wordmark out of a mask, line-work
drawing itself, stripe landing, copy last. Continuity with `/proto` is the
point.

**The rest of the deck.** Every other row draws its line-work the first time
that row is entered — the whole row at once, not just the active cell, because
the neighbours peeking in at the margins would otherwise read as blank panels.
`initDeck({ drawFigures: true })`.

**Per-move, after the boot.** Three things the deck does on every arrival:

| Move | Mechanism | Notes |
|------|-----------|-------|
| Axis-matched depth | ghost `110` / panel `44` / copy `20`, applied on the axis you travelled | A section change used to slide the whole cell as one plane. Running the horizontal ratios vertically is what gives the vertical move real depth. |
| Ghost resolve | `scrambleText` over 0.7s, `revealDelay: 0.12` | The largest element on screen participates in the move instead of being swapped. `initDeck({ scrambleGhost: true })`. |
| Grid parallax | `--travel-x` / `--travel-y` published by the deck, consumed at 1/12 rate | Same publish-don't-apply bargain as `--lean`. The deck states how far it went; the page decides what listens. |

**The construction grid.** A 40px minor / 200px major drafting grid behind the
world, fixed like the chrome. It drifts against the world at a twelfth of its
rate and shears 22px under `--lean`, so the deck reads as a surface being moved
over rather than a stack of panels being swapped. Opacity 0.6 light, 0.3 dark —
the same alpha reads far weaker as ink on cream than as cream on ink.

Its travel transition is `cubic-bezier(0.16, 1, 0.3, 1)`, *not* the shared
`--ease` token. `--ease` is a quint-ish curve and the deck moves on GSAP's
`expo.out`; matching only the duration left the grid visibly drifting against
the world for most of the move. Anything CSS-transitioned alongside a GSAP move
has to match the curve, not just the clock.

**Past the ends.** Travel beyond the first or last item is rubber-banded with
diminishing returns, capped at 10% of the span, and a drag that commits at an
edge still springs back — `goCol`/`goRow` report a refused move so `endDrag` can
settle rather than leaving the world parked wherever the pointer was released.
Past the end is a hint that there is nothing there, not somewhere you get to go.

**A spring back is not an arrival.** `settle(0)` returns a cell that did not
move. It does not replay the arrival tween. If it did, an aborted drag on the
masthead would look like the page had reloaded.

**Mouse dragging is off; the swipe stays.** `initDeck({ drag: "touch" })`. On a
mouse the drag competed with the wheel and the arrow keys for the same job. On a
phone there is no wheel and no arrow keys, so the swipe is the only continuous
control and cannot be given up.

**The type blocks are not drag handles.** `.mast` and `.cell__type` carry
`data-no-drag` and keep `user-select: text`. A deck that is one unbroken drag
surface cannot be read by text-to-speech, because the user must select a
paragraph to have it read aloud.

**The pre-boot frame.** `.deck.is-booting` is in the markup and removed one
frame after the timeline is built. It holds the masthead copy at `opacity: 0`
and suppresses the cell and chrome transitions, so the first painted frame is
already the pre-boot state. Without it the deck cross-fades into itself twice:
the masthead transitioning up from the inactive `0.24`, and the fixed chrome
fading out as `data-accent` resolves to `mast`.

## Scroll reveals

All handled by `initReveals()`, keyed off attributes rather than a manifest:

| Hook | Trigger point | Behaviour |
|------|---------------|-----------|
| `data-fig` | top at 88% | Draws the figure |
| `.stripe` | top at 92% | Assembles segments (`scaleY` if `.stripe--v`) |
| `.rule` | top at 94% | Scales from left |
| `data-reveal` | top at 90% | Fades up; `data-reveal="lines"` splits and masks per line |
| `data-stagger` | top at 82% | Staggers direct children |

Anything inside `.hero` is skipped — the load timeline owns it.

**The `whenVisible` guard.** If an element is already above the trigger line
when the script runs (a reload halfway down the page, a hash link), its
animation runs immediately instead of waiting for a scroll that may never come.
Because the base state is `opacity: 0`, a missed trigger is invisible content,
so this matters more than it looks.

## The pinned panel

The essay pattern. CSS `position: sticky` holds the diagram; ScrollTrigger only
tracks *which* prose chunk is in the reading position.

- Sticky at `top: calc(46px + var(--s-3))` — under the fixed nav.
- Each `<article data-step="n">` has a trigger spanning `top 62%` → `bottom
  62%`, firing on `onEnter` and `onEnterBack`.
- The matching `<g class="callout" data-callout="n">` gets `.is-active`: opacity
  0.22 → 1, strokes to `--cs-red`, label to `--fg`.
- The mono readout under the frame swaps to that chunk's `data-readout` string.
- Below 1080px the sticky is dropped and the diagram simply sits above the
  prose.

Deliberately *not* GSAP pinning. Sticky positioning survives resize, zoom and
reflow without recalculating, and there is no scroll-jacking anywhere on the
site.

## Cursor

Two states, difference-blended so it reads on cream and ink without carrying a
colour of its own.

- **Default** — 34px ring plus a 4px dot, trailing the pointer at 0.22s.
- **Hover** (over `a`, `button`, `[data-cursor]`) — ring goes to 54px and square
  (`border-radius: 0`), the dot scales out, crosshair arms extend, and a mono
  label fades in beside it from the element's `data-cursor` value.
- **Down** — ring contracts to 26px. A physical click.

**Two, and it stays two.** The reticle means exactly one thing — *you can hit
this* — and it only keeps meaning that for as long as nothing else wears it. A
draggable surface is not a target, so it does not set `data-cursor` at all: it
leaves the cursor at rest, which is the honest signal. Where an affordance needs
saying out loud, the chrome says it (`drag ‹ ›`, `scroll down to navigate`)
rather than the pointer growing a new shape.

This replaced a three-shape system — target / surface / field — that was tried
and removed. Each shape was individually defensible and the set was not: more
cursor vocabulary reads as inconsistency, not precision. The original problem it
solved (a reticle sitting over a 100vw panel you cannot click) is better solved
by removing the trigger than by adding a mode.

Labels are verbs: `Open →`, `Invert`, `Read`, `Back`, `Inspect`, `Replay`. The
shape change is CSS transition; only the position is GSAP.

## Theme wipe

The switch is the moment. Three accent bands sweep the viewport left to right at
0.055s apart, the palette swaps under cover at the midpoint, and the bands
retract off the right edge. 0.84s total, locked against re-entry while running.
Under reduced motion the tokens swap directly, with a 0.5s CSS transition on
`background-color` and `color` doing the work.

## Open questions

- Does the essay want a chunk-to-chunk transition on the callout, or is the
  straight cross-fade correct?
- `deck.ts` springs the drag-lean back with `elastic.out(1, 0.5)`, which the
  easing rule above bans outright. Keep it as a deliberate exception for
  physical drag feedback, or bring it back to `power3.out`?
- Should the hero figure redraw on theme change, or is that a gimmick that gets
  old on the second toggle?
