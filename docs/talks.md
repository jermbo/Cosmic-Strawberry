# Talks — markdown with presentation fences

Talks live as markdown under [`src/content/talks/`](../src/content/talks/).
Vite `?raw` imports watch the file so **saving the `.md` hot-reloads the page**.

Live example: `/proto/talks/your-ai-has-amnesia`

| Piece         | Path                                                    |
| ------------- | ------------------------------------------------------- |
| Parse         | [`parse.ts`](../src/lib/proto/talks/parse.ts)           |
| Motion tokens | [`motions.ts`](../src/lib/proto/talks/motions.ts)       |
| Runtime       | [`show.ts`](../src/lib/proto/talks/show.ts)             |
| Page          | [`[slug].astro`](../src/pages/proto/talks/[slug].astro) |

---

## Fence rules

| Fence            | Role                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| `::slide[attrs]` | Leaf separator. Starts a slide; content runs until the next `::slide`. |
| `:::name[attrs]` | Molecule. Put `step` / motion here. Close with `:::`.                  |
| `::::step[…]`    | Escape hatch: wrap plain prose or several blocks as one reveal.        |

Prefer attrs on the molecule. Do **not** wrap `:::cards` / `:::col` / etc. in
`::::step`.

```markdown
:::cards[stack step reveal-bottom]

- **Title** — Body line
  :::
```

Advance: Space / → / click-right reveals the next step, then the next slide.
Back reverses. Swipe left/right on touch.

## Deep links

| Hash   | Meaning                               |
| ------ | ------------------------------------- |
| `#3`   | Slide 3, no reveals yet               |
| `#3.2` | Slide 3, first two step reveals shown |

Numbers are 1-based.

---

## Slide attrs (`::slide[…]`)

### Layout (pick one)

| Token      | Layout                                     |
| ---------- | ------------------------------------------ |
| `title`    | Hero title slide                           |
| `lead`     | Section label + headline + body            |
| `split`    | Copy left, molecules (usually cards) right |
| `break`    | Full-bleed color chapter break             |
| `cta`      | Closing call-to-action (also a color fill) |
| `letters`  | Title + letter row                         |
| `altitude` | Title + stacked cards (altitude content)   |
| `columns`  | Title + two columns                        |
| `matter`   | Alias for `columns`                        |
| `recap`    | Title + recap cards                        |
| `figure`   | Title + one dominant image                 |
| `gallery`  | Title + two-column image grid              |
| _(none)_   | Falls back to `lead`-like body             |

### Accent / fill

| Token      | Use                          |
| ---------- | ---------------------------- |
| `purple`   | Accent + progress            |
| `lime`     | Accent; break/cta fill       |
| `orange`   | Accent; break/cta fill       |
| `lavender` | Break fill (ink-on-lavender) |

### Motion tokens

Defined once in [`motions.ts`](../src/lib/proto/talks/motions.ts):

| Token           | Entrance                           |
| --------------- | ---------------------------------- |
| `fade`          | Soft fade + slight rise            |
| `reveal-bottom` | Rise from below                    |
| `reveal-top`    | Drop from above                    |
| `reveal-left`   | From the left                      |
| `reveal-right`  | From the right                     |
| `zoom-in`       | Scale up from smaller              |
| `zoom-out`      | Scale down from larger             |
| `squish-in`     | Expand from a flat vertical squish |
| `squish-out`    | Un-squash from a wide/flat crush   |
| `pop`           | Scale up with a short overshoot    |

### Reveal rules (on molecules)

| Attrs                         | Behavior                             |
| ----------------------------- | ------------------------------------ |
| `step` (+ optional motion)    | Each list item is its own reveal     |
| motion only (`reveal-bottom`) | Whole molecule arrives as one reveal |
| neither                       | Visible immediately                  |

Default motion when omitted on a step: `fade`.

### Prose conventions

- First paragraph that is only emphasis (`*kicker*` or `_kicker_`) → section kicker
- `#` / `##` → slide title
- Following paragraphs → body / lede
- `![alt](/path.png)` → image (use `figure` or `gallery` layouts for screenshot-heavy slides)

Images live under `public/` and are referenced with a root path, e.g.
`![Nesting](/talks/architecting-your-front-end/Nesting-SCSS-Good.png)`.

---

## Molecules (`:::name[…]`)

### `:::cards[stack|row]`

```markdown
:::cards[stack step reveal-bottom]

- **Direction** — Where the team landed, and how
- **Options tried** — What was attempted and ruled out
  :::
```

- `stack` — vertical (default)
- `row` — horizontal
- `step` — each card is its own reveal
- motion alone — whole grid as one reveal

### `:::letters`

```markdown
:::letters[step reveal-bottom]

- V — Vision
- I — Intent
  :::
```

### `:::col[accent]`

```markdown
:::col[purple reveal-left]

### Five rules

- One complete thought per document
  :::
```

Accents: `purple` | `lime` | `orange` | `lavender`

### `:::recap`

```markdown
:::recap[reveal-bottom]

- **Explanation** — Documentation as decision capture
- **Execution** — Boundary clarity, complexity hidden
- **Expectation** — Tests as specification
  :::
```

`:::recap[step reveal-bottom]` reveals each card in turn.

### `:::pills`

```markdown
:::pills

- Explanation
- Execution
- Expectation
  :::
```

### `:::callout[important|note|warn]`

```markdown
:::callout[important reveal-bottom]
Amnesia is not a model flaw — it is the default.
:::
```

| Attr        | Edge color     |
| ----------- | -------------- |
| `important` | Orange         |
| `warn`      | Orange         |
| `note`      | Lime (default) |

---

## Escape hatch: `::::step[…]`

```markdown
::::step[fade]
A paragraph that should arrive on advance.
::::
```

---

## Adding a molecule

1. Teach [`parse.ts`](../src/lib/proto/talks/parse.ts) the `:::name` container.
2. Add `src/components/talk/molecules/Name.astro` and wire it in [`Block.astro`](../src/components/talk/Block.astro).
3. Style it in [`talk.css`](../src/styles/talk.css).
4. Document it here.

---

## Adding a talk

1. Create `src/content/talks/your-slug.md` with frontmatter:

```yaml
---
title: Your Title
series: TALK 201
description: One-line blurb for the hub.
minutes: 25
date: "2026.08"
idx: T02
ghost: Keyword
variant: trace # stack | orbit | trace | nozzle
---
```

2. The page appears at `/proto/talks/your-slug`. The hub Talks row picks it up from the same frontmatter via [`src/data/talks.ts`](../src/data/talks.ts).
