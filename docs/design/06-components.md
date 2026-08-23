# 06 — Components

**Source of truth:** `src/styles/proto.css` § 6–16
**Live:** [`/proto/kit`](../../src/pages/proto/kit.astro) § 05

Most of these are a class on plain markup rather than an Astro component. That
is deliberate for now — the shape is still moving, and premature extraction
would make it harder to change. Extract when a thing is used on a third page.

## Layout

### `.shell`
The container. `width: min(100% - 2×gutter, 1360px)`, centred. Gutter is
`clamp(1.25rem, 4vw, 4rem)`. Every section's content sits inside one.

### `.section` / `.section--tight`
Vertical rhythm. `--s-16` (128px) block padding, or `--s-12` (96px) for tight.

### `.band`
The workhorse two-column split — headline left, prose right; figure left, text
right. Collapses to one column at 1080px.

## Chrome

### `.marker` — section head

```html
<div class="marker mono">
  <span class="marker__idx">§ 02</span>
  <span class="marker__label">Method</span>
  <span class="marker__count">B / C</span>
</div>
```

Index, name, position in the set, with a hairline under. Every section on every
page opens with one. The `count` is what makes the site feel like a document
rather than a scroll.

### `.spec` — metadata pair

```html
<div class="spec">
  <dt>Operator</dt>
  <dd>Jermbo</dd>
</div>
```

Rule above, faint mono label, mono value. Used in a `<dl class="hero__specs">`
grid. Real `dl`/`dt`/`dd` — it is genuinely a definition list.

### `.nav` — fixed top bar

46px tall, hairline under, `backdrop-filter: blur(8px)` over a translucent
ground. Left: `CS-NAV`, pulsing red status dot, `FW 0.0.1`. Right: page links
with an orange underline that scales in from the left, a live UTC clock, and the
theme toggle. `aria-current="page"` pins the underline on the current route.

### `.progress` — scroll progress

The stripe again, 2px, sitting directly under the nav, scrubbed against document
scroll. Opt-in per page via the layout's `progress` prop; currently only the
essay.

### `.foot`

Hairline over, 96px stripe mark, three mono items spread across.

## Interactive

### `.toggle` — mode switch

```html
<button class="toggle" aria-pressed="false" data-cursor="Invert">
  <span class="toggle__label toggle__label--mode">LT</span>
  <span class="toggle__track"><i></i><i></i><i></i><span class="toggle__knob"></span></span>
</button>
```

A 34px track holding the three accent bands at 28% opacity, with a solid `--fg`
knob travelling 21px across it. The label reads `LT` / `DK`. Firing it runs the
[theme wipe](05-motion.md#theme-wipe). Real `<button>` with `aria-pressed`, and
the choice persists to `localStorage` under `cs-proto-theme`.

### `.card` — crossing teaser

```html
<a class="card" href="…" data-cursor="Open →">
  <div class="card__head mono">…index… …date…</div>
  <div class="card__fig"><SchemaMark variant="trace" /></div>
  <div class="card__title"><h3 class="h3">…</h3><p>…</p></div>
  <div class="card__foot mono">…meta… <span class="card__go">READ →</span></div>
  <span class="card__bar"><i></i><i></i><i></i></span>
</a>
```

Not a box. Cards are separated by hairlines only, with the first and last
flush to the shell edges so the row reads as a table rather than three
floating tiles. On hover: the stripe bar slides up from the bottom edge, the
figure lifts 4px, and the arrow advances 5px. Three tells, all small.

### `.cursor`

Built once in the layout, driven by `cursor.ts`. See
[Motion § Cursor](05-motion.md#cursor). Any element can set its label — but only
set `data-cursor` on something that is genuinely a target, because that is the
whole meaning of the reticle:

```html
<a href="…" data-cursor="Open →">…</a>
```

## Content

### `.prose`
Body copy with a 62ch measure and a weighted `::first-line`. `.drop` is the
small mono kicker above it.

### `.pull`
Pull quote. 3px orange keyline on the left, 26ch measure, weight 600. One per
essay section at most.

### `.band__note`
Standing copy with a vertical stripe beside it. The stripe is 4px wide and
stretches to the block's height, assembling top-to-bottom.

## The essay pattern

### `.pinned`

The pattern the whole prototype exists to prove.

```html
<div class="pinned">
  <div class="pinned__panel">          <!-- sticky -->
    <div class="pinned__bar mono">…figure number… …scale…</div>
    <div class="pinned__frame"><SchemaCutaway /></div>
    <div class="pinned__readout mono"><b data-readout>…</b> …rev…</div>
  </div>

  <div class="pinned__prose">
    <article class="chunk" data-step="1" data-readout="SEC 01 — APERTURE">
      <div class="chunk__head mono">…01… …Aperture…</div>
      <div class="prose" data-reveal>…</div>
    </article>
    …
  </div>
</div>
```

- `.pinned__frame` carries the 32px construction grid and corner brackets — the
  diagram sits on drafting paper, framed like a plate in a manual.
- `data-step` on a chunk pairs with `data-callout` on a `<g>` in the SVG.
- `data-readout` is the mono string that appears under the frame for that
  section.
- Below 1080px, sticky is dropped and the panel stacks above the prose.

## Naming

Loose BEM: `.block`, `.block__element`, `.block--modifier`. State is `.is-*`
(`.is-set`, `.is-active`, `.is-hover`, `.is-down`, `.is-live`) and is always set
by JS, never authored in markup. Behaviour hooks are `data-*` attributes
(`data-fig`, `data-reveal`, `data-stagger`, `data-step`, `data-cursor`), never
classes — so restyling can never break the animation wiring.

## Not yet built

Things a real site will need that this prototype does not have:

- A crossings index/archive page
- Pagination or a next/prev pattern beyond the essay footer's single link
- Inline images, code blocks, footnotes, or lists inside `.prose`
- A 404
- Any form
