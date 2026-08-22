# 04 — Line-work

**Source of truth:** `src/styles/proto.css` § 10, `src/components/proto/*.astro`
**Live:** [`/proto/kit`](../../src/pages/proto/kit.astro) § 04 and § 08

The recurring motif. Thin, precise, technical — aerospace cutaway conventions,
not illustration. It appears in the hero, in every method step, on every
crossing card, and at full size beside the essay. It is the texture of the site,
which is why it can't only be a hero image.

## Non-negotiables

- **1px, always.** Every stroke carries `vector-effect: non-scaling-stroke`, so
  a figure scaled to 800px has the same hairline as one at 160px.
- **No fill except the accent marks.** Shapes are outlines. Solid areas are only
  the small square/circle nodes and terminal dots.
- **No painterly anything.** No glow, no gradient, no shadow, no texture inside
  the drawing, no perspective rendering. Isometric or straight orthographic
  section only.
- **Annotation is mono**, 8px, `+0.16em`, upper — the same voice as the rest of
  the chrome, just inside an SVG.

## Stroke classes

| Class | Colour | Use |
|-------|--------|-----|
| `.ln` | `--fg` | Primary edges — the outline of the thing |
| `.ln--faint` | `--rule-strong` | Internal detail, hatch, dimension runs, ticks |
| `.ln--dash` | `--rule-strong`, `3 4` | Construction lines, centrelines, orbits |
| `.ln--red` / `--orange` / `--blue` | accent | State only — active callouts, one traced signal |
| `.fill-fg` | `--fg` | Terminal dots |
| `.fill-red` / `--orange` / `--blue` | accent | Nodes, the one point that matters |
| `.txt` | `--fg-mute` | Annotation |
| `.txt--lead` | `--fg` | The one annotation that leads |

All of them inherit the mode tokens, so a figure works in light and dark without
a second version. All `.ln` elements are picked up automatically by the draw-in
animation — see [Motion](05-motion.md).

## The vocabulary

Every figure is assembled from these six things. Nothing else is in the
language:

1. **Registration marks** — corner brackets, `.ln--faint`. The frame of the
   drawing.
2. **Construction axes** — dashed centrelines through the subject, extending
   past its edges.
3. **The subject** — outlined in `.ln`, internal detail in `.ln--faint`.
4. **Section hatch** — evenly spaced short parallels across a cut wall. Signals
   "this is a section, not a silhouette."
5. **Dimension run** — a line between two end ticks, broken in the middle for a
   mono label (`2.400 M`, `R 1.000 AU`).
6. **Callout** — terminal dot → one elbow → one horizontal run → label above the
   run.

## Callout anatomy

The single most repeated construction, and the easiest to get wrong.

```
  ●────────╮
           ╰──────────────  01 / APERTURE
```

- **Terminal dot** — `.fill-fg`, r 2.4–2.6, sitting *on* the part it names.
- **One elbow.** Diagonal out, then horizontal. Never a straight diagonal
  running into text, never two elbows.
- **Horizontal run** ends at the figure's margin; the label sits 8px above it,
  `text-anchor="end"` on the right, `start` on the left.
- **Numbered** `01 /` through `04 /`, clockwise from the top.

Grouped as `<g class="callout" data-callout="1">` so the essay page can activate
one at a time.

## Drawing a new figure

1. Pick a viewBox with room to breathe — annotations live outside the subject.
   Existing: 400×400 (hero), 220×150 (marks), 480×600 (cutaway).
2. Put `class="schema"` and `data-fig` on the `<svg>`. `data-fig` is what
   registers it for the draw-in.
3. Give it a real `role="img"` and `aria-label`. The figures carry meaning.
4. Lay down registration marks and axes first, subject second, annotation last.
   Document order is animation order — the drawing builds outward-in the same
   way you'd draft it.
5. Compute repeated geometry in the component frontmatter rather than typing
   coordinates. `SchemaCore` generates its section hatch and seed ring from
   angles; `SchemaCutaway` generates its wall hatch and lattice from loops.

```astro
---
const hatch = Array.from({ length: 19 }, (_, i) => { /* … */ });
---
<svg class="schema" viewBox="0 0 400 400" role="img" aria-label="…" data-fig>
  <g class="ln ln--faint">
    {hatch.map((h) => <line x1={h.x1} y1={h.y1} x2={h.x2} y2={h.y2} />)}
  </g>
</svg>
```

## The current figures

| Component | Size | Where | Subject |
|-----------|------|-------|---------|
| `SchemaCore` | 400×400 | Hero, kit § 08 | Sectioned core, seed ring, transfer orbit, 3 callouts |
| `SchemaMark variant="stack"` | 220×150 | Method A | Exploded isometric assembly |
| `SchemaMark variant="trace"` | 220×150 | Method B, card 001 | Signal against a threshold |
| `SchemaMark variant="orbit"` | 220×150 | Card 002, kit motion stage | Path with apoapsis node |
| `SchemaMark variant="nozzle"` | 220×150 | Method C, card 003 | Nozzle section with seal callout |
| `SchemaCutaway` | 480×600 | Essay, pinned | Longitudinal section, 4 activatable callouts |

## Why a fruit is a spacecraft

The hero figure reads as both a fruit cross-section and a vehicle section — a
seed ring where the payload bay would be, a transfer orbit around it. That joke
is the whole brand in one drawing, and it is worth protecting: the figures
should stay ambiguous between botanical section and engineering section rather
than committing to either.

## Open questions

- Should each essay get a bespoke cutaway, or a small library of figures the
  writing is fitted to?
- Is there a place for an exploded *axonometric* at hero scale, rather than the
  flat section currently there?
