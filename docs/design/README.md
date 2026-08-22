# Cosmic Strawberry — Design System

The written half of the `/proto` prototype. The live half is the kit page at
[`/proto/kit`](../../src/pages/proto/kit.astro), which renders every token,
mark and motion from the same stylesheet the site uses. **When the two
disagree, the kit page is right and this folder is stale.**

## Read in this order

| # | Document | What it settles |
|---|----------|-----------------|
| 00 | [Brief](00-brief.md) | What the prototype is, what it is not, what it is for |
| 01 | [Design intent](01-design-intent.md) | The five principles everything else is downstream of |
| 02 | [Colour](02-colour.md) | Two modes, one accent, and the rules for the stripe |
| 03 | [Typography](03-typography.md) | Two voices — the sans and the mono — and when each speaks |
| 04 | [Line-work](04-line-work.md) | The schematic language: strokes, callouts, how to draw a new figure |
| 05 | [Motion](05-motion.md) | Animation principles, the nine moves, exact timings |
| 06 | [Components](06-components.md) | Inventory, markup, and the state each one carries |
| 07 | [Architecture](07-architecture.md) | File map, wiring, and how to add a page |

## Fast facts

- **Stack** — Astro 7 + GSAP 3.15, raw CSS, no framework, no Tailwind, no new packages.
- **Routes** — `/proto` (index), `/proto/crossings/hard-vacuum` (essay), `/proto/kit` (this system, live).
- **Reference** — Retronova (2024 Awwwards SOTD) crossed with the NASA Graphics
  Standards Manual, 1975–92, Danne & Blackburn.
- **Isolation** — nothing in `/proto` touches the existing landing page. Separate
  layout, separate stylesheet, separate lib directory.

## Open questions

- Does the mono stay Share Tech Mono, or move to something with real weights
  (IBM Plex Mono, Söhne Mono) now that it carries metadata rather than CRT vibe?
- Archivo is standing in for the worm-family headline face. Licensed alternative?
- Does the stripe order (red → orange → blue) ever reverse, or is it fixed like
  a livery?
