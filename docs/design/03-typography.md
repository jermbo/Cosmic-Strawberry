# 03 — Typography

**Source of truth:** `src/styles/proto.css` § 4
**Live specimens:** [`/proto/kit`](../../src/pages/proto/kit.astro) § 03

Two families, two jobs, no overlap. The sans is the voice; the mono is the
instrument.

## The families

### Archivo — headlines and content

A variable grotesk with a real width axis (`wdth 62..125`), which is what makes
the worm-era feel reachable: the NASA logotype family is *extended* geometric,
not just bold. Every headline role pushes the width axis past 100.

```
font-family: "Archivo", "Helvetica Neue", Helvetica, Arial, sans-serif;
```

Standing in for a licensed face closer to the actual Danne & Blackburn family —
Eurostile, Söhne Breit, General Sans. When that swap happens, only
`--sans` changes.

### Share Tech Mono — interface chrome

Carried over from the coming-soon page. It is what makes `CS-NAV / FW 0.0.1 /
◉ LINK` feel like the same site. Single weight, which is a constraint worth
knowing: hierarchy in the mono comes from size, tracking and colour only.

```
font-family: "Share Tech Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;
```

Both load from Google Fonts in `Proto.astro` with `display=swap` and preconnect.

## Scale

| Class | Weight | Width | Size | Line-height | Tracking | Case |
|-------|--------|-------|------|-------------|----------|------|
| `.display` | 800 | 118% | `clamp(3.5rem, 13.5vw, 12.5rem)` | 0.84 | -0.018em | Upper |
| `.h2` | 700 | 112% | `clamp(2rem, 5.2vw, 4.25rem)` | 0.92 | -0.012em | Upper |
| `.h3` | 700 | 108% | `clamp(1.25rem, 2.2vw, 1.9rem)` | 1.0 | -0.005em | Upper |
| `.lede` | 400 | 100% | `clamp(1.125rem, 1.9vw, 1.5rem)` | 1.42 | -0.008em | Sentence |
| `.prose p` | 400 | 100% | `clamp(1rem, 1.15vw, 1.125rem)` | 1.66 | — | Sentence |
| `.pull` | 600 | 106% | `clamp(1.25rem, 2vw, 1.65rem)` | 1.28 | -0.012em | Sentence |
| `.mono` | 400 | — | 0.7rem | 1.0 | +0.16em | Upper |
| `.mono-sm` | 400 | — | 0.625rem | 1.0 | +0.2em | Upper |

The pattern across the scale: **as size goes up, line-height and tracking go
down.** Big type is set tight enough that the words form a block; small type is
set loose enough to stay legible at weight.

## Measure

| Role | Max width |
|------|-----------|
| `.lede` | 34ch |
| `.prose p` | 62ch |
| `.pull` | 26ch |
| `.step p` | 32ch |
| `.card` blurb | column width |

Measure is enforced on the element, not the container, so a wide layout never
produces a 120-character line.

## Rules of use

- **Headlines are uppercase and flush left.** Never centred — centred type is a
  different design system. Never letter-spaced out; the width axis does that
  job, not tracking.
- **Body copy is sentence case in the sans**, at `color-mix(--fg 88%)` so it
  sits a step back from headlines without going grey.
- **All metadata is mono, uppercase, `--fg-mute`.** Timestamps, coordinates,
  sheet numbers, section indexes, figure captions, revision marks, cursor
  labels.
- **The two never swap.** No mono body copy, no sans timestamps. This is the
  clearest single rule in the system and the fastest way to spot a page that
  went wrong.
- **`.drop`** is the small mono kicker above a prose block (`Standing order`,
  `Abstract`, `Reading the figure`). It is the one place the mono introduces
  content rather than labelling chrome.
- **First line of a prose block is set at weight 600** via `::first-line`, which
  gives an essay a lede without needing a separate element.

## Typographic chrome vocabulary

The mono labels are a small fixed set. Reuse them rather than inventing:

```
§ 01            section index
A / C           position in a set
FIG. 1          figure number
SHEET 02 / 03   page position
REV. C          revision
FILED 2026.04.11
18 MIN / ESSAY  reading time / kind
◉ SIGNAL NOMINAL
CS-NAV / FW 0.0.1
```

Numbers use `font-feature-settings: "tnum"` so columns of them line up.

## Open questions

- Share Tech Mono has one weight and some quirky glyphs. Worth moving to IBM
  Plex Mono for real metadata work, or is the quirk part of the identity?
- Should `.display` gain a tighter width axis at small viewports so the wordmark
  fits two words per line on mobile without dropping below ~3.5rem?
