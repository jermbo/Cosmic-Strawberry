# 01 — Design intent

Five principles. Everything in the other documents is a consequence of one of
them. When a new decision comes up and the specs don't cover it, decide here.

---

## 1. Confidence comes from precision, not volume

The NASA manual is not impressive because it is loud. It is impressive because
every measurement in it was decided once and then honoured on 400 pages. A
system earns authority by being exact and then not wavering.

**In practice**

- Every value is a token. Nothing is typed in as a one-off pixel.
- The space scale is 8px and has no in-between steps. If something needs 20px,
  it needs 16 or 24 and the layout is wrong.
- Hairlines are 1px everywhere, including inside SVG, where
  `vector-effect: non-scaling-stroke` keeps them 1px at any figure size.
- Line-height, tracking and width axis are specified per type role, not left to
  the browser.

**The test:** could a second person rebuild a new page and have it match
without asking a question? If not, a value is missing.

---

## 2. A small inventory, applied without exception

The whole design is: two typefaces, two grounds, three accent colours, four
stroke weights, one stripe, one grid. That is the entire kit. Restraint is not
what's left after you cut — it is the starting constraint.

**In practice**

- New sections rearrange existing elements. They do not introduce new ones.
- If a state seems to need a fourth colour, it needs a different signal —
  position, weight, a rule, a mono label.
- New figures are drawn with the existing stroke classes, which is also how they
  inherit dark mode and the draw-in animation for free.

**The test:** can you name every element on the page from the kit? If something
is unnameable, it is either missing from the kit or shouldn't exist.

---

## 3. The accent is a device, not a decoration

The three-colour stripe is the one loud thing. It works *because* it is rationed
— roughly once per screen, always on an edge or a divider, never behind copy,
never as a wash, never blended.

**In practice**

- Hard stops only. There is no gradient anywhere in this design.
- It appears as: the hero divider, a vertical marker beside standing copy, the
  card hover bar, the footer mark, the scroll progress bar, the theme wipe.
- Body text is never accent-coloured. The one exception is a callout that is
  currently active on the essay diagram, which is state, not styling.

**The test:** count the stripe appearances in one viewport. More than one means
one of them is decoration.

---

## 4. Things assemble; they do not appear

A fade is an object arriving with no explanation. Everything here is built in
front of the reader instead: strokes draw along their own path, stripe segments
land one after another, headlines rise out of a mask, rules scale from the left.

This is the Retronova half of the reference, and it is also what makes the
schematic motif more than an illustration — a technical drawing that draws
itself is the whole idea in one gesture.

**In practice**

- Line-work uses DrawSVG along the real path, not opacity.
- One direction per element, and it is always the reading direction: left to
  right, top to bottom.
- Nothing scales up from zero, nothing bounces, nothing blurs, nothing rotates
  in.
- Under `prefers-reduced-motion`, elements are placed in their final state at
  paint — not hidden waiting for a trigger that will never fire.

**The test:** freeze the animation halfway. It should look like a drawing in
progress, not a broken layout.

---

## 5. Interface chrome speaks a different language than content

Two voices, and they never trade jobs. The mono is instrumentation — labels,
timestamps, coordinates, sheet numbers, revision marks. The sans is the human
speaking. The mono carries over from the coming-soon page (`CS-NAV`, `FW 0.0.1`,
`◉ LINK`) and is the thread of continuity between the two eras of the site.

The chrome is allowed to be slightly fictional. Sheet numbers, `REV. C` and a
running UTC clock are not data — they are the sound of a working instrument, and
they cost nothing.

**In practice**

- Mono: uppercase, `+0.16em` tracking, 0.7rem, `--fg-mute`. Always.
- Sans: sentence case, tight tracking, `--fg`. Never uppercase below headline
  size.
- Metadata never appears in the sans. Body copy never appears in the mono.

**The test:** cover the content. The remaining chrome should read like the
margin of a technical drawing.

---

## The one-line version

> Draw it like an aerospace manual, animate it like it's being drafted, and
> spend the colour once.
