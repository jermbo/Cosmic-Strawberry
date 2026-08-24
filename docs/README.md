# Cosmic Strawberry — Docs

Working notes for the landing page. Structure is provisional; reorganize freely.

## Design system

[**docs/design/**](design/README.md) — the written half of the `/proto`
prototype: design intent, colour, typography, the schematic line-work language,
animation principles, component inventory, and how it is wired. The live half is
the kit page at `/proto/kit`.

## Talks

[**docs/talks.md**](talks.md) — markdown decks with `::slide` / `:::molecule` /
molecule fences. Live example: `/proto/talks/your-ai-has-amnesia`.

## Ideas

Each file is one self-contained concept: what it is, how it would be built, and
what's still unresolved. Constraint across all of them — **Astro + GSAP only, no
new packages**. The installed `gsap@3.15.0` ships every plugin (MorphSVG,
Draggable, Inertia, Physics2D, DrawSVG, MotionPath, Flip, ScrollTrigger,
SplitText, ScrambleText, CustomEase/Wiggle/Bounce) with no registry auth.

### Built

- [Constellation Assembly](ideas/constellation-assembly.md) — COSMIC forms out of the sky instead of flying in.
- [Hyperspace Jump](ideas/hyperspace-jump.md) — click to warp; re-enter on a fresh sky.
- [Secret Detonation](ideas/secret-detonation.md) — type the secret word, blow up the wordmark.

### In progress

- [Cold Boot](ideas/cold-boot.md) — the page boots like a terminal; ASCII resolves into the logo.

### Enhancements to the current concept

- [Strawberry Morph](ideas/strawberry-morph.md) — the letters flow into a strawberry.
- [Draggable Letters](ideas/draggable-letters.md) — grab and throw them, zero-G.
- [Cursor Gravity](ideas/cursor-gravity.md) — stars parallax and bend toward the pointer.

### Reimaginings

- [Powers of Ten](ideas/powers-of-ten.md) — zoom out from a galaxy to reveal a strawberry.
- [Find the Constellation](ideas/find-the-constellation.md) — pan a huge sky to discover the wordmark.
- [Living Letters](ideas/living-letters.md) — permanent idle life; letters dodge the cursor.
- [Singularity](ideas/singularity.md) — everything spirals into a black hole and back out.
- [Zero-G](ideas/zero-g.md) — nothing is ever quite in formation.
