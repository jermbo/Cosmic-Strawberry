# 02 — Colour

**Source of truth:** `src/styles/proto.css`, `:root` and `[data-theme="dark"]`
**Live:** [`/proto/kit`](../../src/pages/proto/kit.astro) § 01

Two modes with the same DNA, plus one accent spent sparingly. Five colours
total. There is no sixth.

## The palette

| Token | Role | Light | Dark |
|-------|------|-------|------|
| `--cs-cream` | Paper | `#F3EDD8` | text colour |
| `--cs-cream-deep` | Panel tint | `#E7DFC4` | — |
| `--cs-ink` | Ink | `#070707` | ground colour |
| `--cs-red` | Accent A | `#D8402F` | `#E8503D` |
| `--cs-orange` | Accent B | `#E8892B` | `#F09A3A` |
| `--cs-blue` | Accent C | `#2B4C9B` | `#4468BD` |

The accents lift slightly in dark mode. Cream on near-black reads hotter than
ink on cream, so the same hex values would look muddy against `#070707`; the
dark values are raised in value, not shifted in hue.

`#070707` rather than `#000000` on purpose — pure black on a screen reads as a
hole. Seven percent of nothing still reads as a printed ink.

## Semantic layer

**Components never reference a raw colour.** They reference a role, so a mode
switch is a token swap and nothing else changes.

| Token | Used for |
|-------|----------|
| `--bg` | Page ground |
| `--bg-panel` | Framed panels (the pinned diagram frame) |
| `--fg` | Primary text, headlines, primary line-work |
| `--fg-mute` | Body copy, mono chrome |
| `--fg-faint` | Secondary metadata, ticks, dimension labels |
| `--rule` | Hairlines at rest |
| `--rule-strong` | Section-level hairlines, borders under markers |

`--fg-mute` and friends are built with `color-mix()` against the ground rather
than fixed greys, so they stay correctly weighted in both modes automatically.

## Rules for the stripe

The three accents only ever appear together, in order, as the stripe. They are
not a general-purpose palette.

**Always**

- Red → orange → blue, left to right or top to bottom. The order is fixed, like
  a livery.
- Equal segment widths, hard stops, no gradient, no blur, no blend.
- On an edge or as a divider: a rule under a hero, a vertical marker beside
  standing copy, a bar that slides up from a card's bottom edge.
- Roughly once per viewport.

**Never**

- As a background behind text.
- As a full-width wash or a large filled area.
- Interpolated between the three colours.
- Reordered, recoloured, or extended to four segments.
- On body copy, links, or as a text colour.

### Where it currently appears

| Placement | Element | Height |
|-----------|---------|--------|
| Hero divider | `.hero__stripe` | `clamp(12px, 1.6vw, 20px)` |
| Standing-copy marker | `.stripe--v` in `.band__note` | 4px wide |
| Card hover bar | `.card__bar` | 4px |
| Essay head divider | `.essay-head__stripe` | `clamp(10px, 1.2vw, 16px)` |
| Scroll progress | `.progress` | 2px |
| Theme wipe | `.wipe i` × 3 | full viewport, transient |
| Footer mark | `.foot__mark` | 8px, 96px wide |

## Single-colour uses

Three exceptions where one accent appears alone, all of them *state* rather than
decoration:

- `--cs-red` — the nav status dot, the active essay callout, the "don't" bullets
  in the kit.
- `--cs-orange` — the pull-quote keyline, the nav link underline on hover, the
  `::selection` background, the resonator centre in the cutaway.
- `--cs-blue` — orbital nodes in the schematic marks, the "do" bullets in the
  kit.

Read those as an accent doing a job. Anything beyond a keyline, a dot or a
marker goes back to being a stripe.

## Texture

One texture, at almost nothing: an SVG `feTurbulence` grain fixed over the
viewport at 5% opacity (7% in dark), `multiply` in light and `screen` in dark.
It exists so large flat areas of cream don't read as a blank div, and it should
never be visible as an effect. If you can see the grain, it is too strong.

The pinned diagram frame carries a second texture: a 32px construction grid
drawn in `--rule`, which reads as drafting paper under the figure.

## Contrast

Ink on cream is roughly 17:1 and cream on ink roughly the same, so body copy has
enormous headroom. The values that need watching are `--fg-faint` (used only for
non-essential metadata and tick labels) and the accents against their ground —
the blue is the tightest pairing in light mode, which is why it never carries
text.

## Open questions

- Is the light ground too warm at `#F3EDD8`? A cooler cream reads more Swiss,
  less NASA.
- Should dark mode use a slightly warmer ink (`#0A0908`) to keep the paper
  feeling rather than reading as pure screen?
