# Constellation Assembly

**Status:** Built
**Plugins:** DrawSVGPlugin
**Files:** `src/components/CosmicLogo.astro`, `src/lib/intro.ts`

## The idea

COSMIC doesn't fly in from offscreen — it forms out of the sky. Stars appear at
the letter's key vertices, lines draw between them to sketch the letterform, and
the solid geometric shape settles into the outline before the scaffolding fades.

Ties the canvas starfield and the SVG wordmark into one idea instead of two
layers that ignore each other.

## How it works

Each letter group carries three children: `.letter-lines` (a DrawSVG path
through the node points), `.letter-nodes` (cyan circles), and `.letter-shape`
(the original filled geometry). Node coordinates are generated in the component
frontmatter — `ring()` places points around the 100×100 letter circle by degree,
and the S/M/I sets are hand-placed.

`assembleLetter()` runs nodes → lines → shape → fade scaffolding, and the six
letters stagger 0.28s apart.

## Open questions

- Node positions for S are eyeballed; could be tightened.
- The constellation could be procedurally different on each load.
