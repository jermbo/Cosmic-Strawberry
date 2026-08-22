# 00 — Brief

**Status:** Built, iterating
**Routes:** `/proto`, `/proto/crossings/hard-vacuum`, `/proto/kit`

## What this is

A vibe prototype for the personal site. Two pages and a kit, built to answer one
question: *does this look and feel right enough to build the real thing on?*

It is deliberately not the content architecture. The copy is placeholder, the
essay is lorem with a spine, the three crossing cards all point at the same
page. None of that is an oversight — it is what keeps the prototype cheap enough
to throw away.

It lives at `/proto` so the existing coming-soon landing page stays exactly as
it is. Nothing is shared between them but the repo.

## The reference crossing

Two sources, held in tension:

**Retronova** (retronovaworld.com, 2024 Awwwards Site of the Day) — for
interaction. The custom cursor with real states, reveals that build rather than
fade, the pinned panel where a figure holds still while prose moves past it.
Borrowed: the mechanics. Not borrowed: the palette or the mood.

**NASA Graphics Standards Manual, 1975–92** (Danne & Blackburn, the "worm" era)
— for discipline. A tiny inventory of elements, applied without exception. Flat
colour, hairline rules, a grid nobody deviates from, and one accent device that
appears where it is needed and nowhere else.

The synthesis: *Retronova's hands, the NASA manual's rules.*

## What it is for

1. Reacting to. Look at it, say what's wrong, change it.
2. Proving the essay pattern. The pinned-diagram-plus-scrolling-prose layout is
   the one that has to work for years, so it got built first, on a real page.
3. Establishing the vocabulary. Every subsequent page should be assemblable
   from what is already in [the kit](06-components.md) without inventing a new
   element.

## What it is explicitly not

- **Not neon.** No glow, bloom, or cyberpunk. That was a different reference for
  a different project.
- **Not maximalist.** The confidence is meant to come from exact values and
  restraint, not from stacked effects.
- **Not a component library yet.** Astro components exist where repetition
  demanded them (`SchemaMark`, `SchemaCore`, `SchemaCutaway`, `Proto` layout).
  Everything else is markup plus a class, on purpose, until the shape settles.

## What is placeholder and will be replaced

| Thing | Standing in for |
|-------|-----------------|
| Essay body copy | Real writing |
| `Hard Vacuum`, `Second Stage`, `Throat Diameter` | Real crossings |
| Archivo | A licensed geometric sans closer to the worm family |
| The cutaway's subject | A diagram that actually illustrates the essay it sits beside |
| Coordinates, sheet numbers, `REV. C` | Kept — they are chrome, not data |

## Open questions

- Is the hero wordmark big enough, or should it run edge to edge?
- Should the essay diagram be per-essay bespoke, or a small set of reusable
  figures the writing is fitted to?
- Does the index need a fourth section between Method and Crossings, or is the
  short scroll the point?
