# 07 — Architecture

How the prototype is wired, and what to touch when you want to change something.

## File map

```
src/
├─ layouts/
│  └─ Proto.astro              nav, cursor, wipe, progress, fonts, script boot
├─ pages/proto/
│  ├─ index.astro              homepage
│  ├─ kit.astro                the live design system
│  └─ crossings/
│     └─ hard-vacuum.astro     example essay, pinned pattern
├─ components/proto/
│  ├─ SchemaCore.astro         400×400 hero figure
│  ├─ SchemaMark.astro         220×150, four variants
│  └─ SchemaCutaway.astro      480×600, four activatable callouts
├─ lib/proto/
│  ├─ reveal.ts                hero timeline, scroll reveals, pinned, progress
│  ├─ cursor.ts                two-state cursor
│  └─ theme.ts                 mode switch + stripe wipe
└─ styles/
   ├─ proto.css                the design system
   └─ kit.css                  presentation chrome for the kit page only
```

Everything is namespaced under `proto`. The existing landing page
(`src/pages/index.astro`, `src/styles/landing.css`, `src/lib/*.ts`) shares
nothing with it but the repo and the GSAP dependency.

## Stylesheet order

`proto.css` is numbered top to bottom and should stay that way:

```
1  tokens          10 schematic line-work
2  reset           11 hero
3  layout          12 sections
4  type            13 cards
5  the stripe      14 footer
6  rules & markers 15 essay page
7  nav             16 progress
8  theme toggle    17 reveal defaults
9  cursor          18 responsive
```

Tokens first, primitives next, page-specific last, responsive and reduced-motion
at the bottom. `kit.css` is loaded only by the kit page and contains nothing the
site itself uses.

## Boot sequence

`Proto.astro` runs two scripts:

**Inline, in `<head>`** (`is:inline`, before paint) — adds `.js` to
`<html>` and reads the stored theme, falling back to
`prefers-color-scheme`. This runs before first paint so there is no flash of the
wrong mode. The `.js` class is what gates `[data-reveal] { opacity: 0 }`, so with
JS disabled every element renders visible.

**Module, at end of `<body>`** — waits on `document.fonts.ready`, then:

```ts
initTheme();     // toggle + wipe
initCursor();    // two-state cursor
playHero();      // hero timeline, no-ops without .hero
initReveals();   // scroll reveals
initProgress();  // no-ops without .progress
initPinned();    // no-ops without .pinned
```

Every init is a no-op when its markup is absent, so the same boot runs on all
three pages without branching.

Waiting on fonts matters: SplitText measures line boxes, and splitting against a
fallback face then swapping to Archivo produces wrong line breaks mid-animation.

## Contracts between markup and script

Behaviour is attached by `data-*` attribute, never by class. Styling and
behaviour can move independently.

| Attribute | Read by | Effect |
|-----------|---------|--------|
| `data-fig` | `reveal.ts` | Register an SVG for the draw-in |
| `data-reveal` | `reveal.ts` | Fade up; `="lines"` splits and masks per line |
| `data-stagger` | `reveal.ts` | Stagger this element's direct children |
| `data-step` / `data-callout` | `reveal.ts` | Pair a prose chunk with a diagram callout |
| `data-readout` | `reveal.ts` | Mono string shown under the pinned frame |
| `data-cursor` | `cursor.ts` | Cursor label, and marks the element interactive |
| `data-cursor-root` | `cursor.ts` | The one live cursor element, in the layout |
| `data-clock` | `Proto.astro` | Live UTC readout |
| `data-replay` | `kit.astro` | Re-run the motion demo |

Inside SVG, the animation contract is the class: `.ln` gets drawn, `.txt` and
`[class*="fill-"]` get faded in behind it. Draw a figure with those classes and
it animates with no other work.

## Adding a page

1. Wrap in the layout:
   ```astro
   <Proto title="…" section="…" progress={false}>…</Proto>
   ```
2. Open each section with a `.marker`, put content in a `.shell`.
3. Use `data-reveal` on copy, `data-stagger` on groups, `.stripe` where the
   accent is earned — once.
4. New figure? Follow [Line-work § Drawing a new figure](04-line-work.md#drawing-a-new-figure).
5. Add the route to the nav in `Proto.astro` if it is top-level.

Nothing needs registering. The reveal system finds its own work on every page.

## Dependencies

`astro@7.2.1` and `gsap@3.15.0`. Nothing else, and the constraint holds: the
installed GSAP ships every plugin, so DrawSVG, SplitText and ScrollTrigger are
available without a registry token.

Plugins used here: **ScrollTrigger** (reveals, pinned steps, progress),
**DrawSVG** (line-work), **SplitText** (masked headline lines). The landing page
additionally uses ScrambleText.

## Performance notes

- Reveals are `once: true`, so ScrollTrigger instances stop doing work after
  they fire.
- The cursor uses `gsap.quickTo`, which reuses one tween instead of creating one
  per pointer event.
- Shape changes on the cursor are CSS transitions on compositor-friendly
  properties; only position is JS-driven.
- The grain overlay is a single fixed pseudo-element with a 160px tiled data
  URI — no image request.
- Fonts are the only network dependency beyond the page itself.

## Known rough edges

- `SchemaCutaway`'s callout leader lines are hand-placed; a long label in a new
  language would collide with the figure.
- The kit page's static cursor demos duplicate `.cursor` markup and override its
  blend mode — fine for a kit, but it means cursor CSS has two consumers, and
  the live one has to be found by `[data-cursor-root]` rather than by class.
- The essay's three crossing cards all link to the same page.
- No view transitions between routes; each navigation replays the load sequence.
