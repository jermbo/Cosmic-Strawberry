# Talks — markdown with presentation fences

Talks live as markdown under [`src/content/talks/`](../src/content/talks/).
The show page imports the file with Vite `?raw` so **saving the `.md` hot-reloads
the page**. (Astro content collections alone do not put the body on the page's
module graph, so edits looked stuck.)

Live example: [`/proto/talks/your-ai-has-amnesia`](../src/pages/proto/talks/your-ai-has-amnesia.astro)

Source of truth for parsing: [`src/lib/proto/talks/parse.ts`](../src/lib/proto/talks/parse.ts)
Runtime (slide + step nav): [`src/lib/proto/talks/show.ts`](../src/lib/proto/talks/show.ts)

---

## Fence rules

| Fence            | Role                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| `::slide[attrs]` | Leaf separator. Starts a slide; content runs until the next `::slide`. |
| `:::name[attrs]` | Molecule. Put `step` / motion here. Close with `:::`.                  |
| `::::step[…]`    | Escape hatch: wrap plain prose or several blocks as one reveal.        |

Prefer attrs on the molecule. Do **not** wrap `:::cards` / `:::col` / etc. in
`::::step` — that nesting is redundant.

```markdown
:::cards[stack step reveal-bottom]

- **Title** — Body line
  :::
```

Advance order: Space / → / click-right reveals the next step on the
current slide, then moves to the next slide. Back reverses.

## Deep links

The show keeps place in the URL hash (via `history.replaceState`):

| Hash   | Meaning                               |
| ------ | ------------------------------------- |
| `#3`   | Slide 3, no reveals yet               |
| `#3.2` | Slide 3, first two step reveals shown |

Refresh and shared links land on the same slide/reveal. Numbers are 1-based.

---

## Slide attrs (`::slide[…]`)

Order does not matter. Unknown tokens are ignored.

### Layout (pick one)

| Token      | Layout                                     |
| ---------- | ------------------------------------------ |
| `title`    | Hero title slide                           |
| `lead`     | Section label + headline + body            |
| `split`    | Copy left, molecules (usually cards) right |
| `break`    | Full-bleed color chapter break             |
| `cta`      | Closing call-to-action (also a color fill) |
| `letters`  | Title + VIBES-style letter row             |
| `altitude` | Title + altitude rows                      |
| `columns`  | Title + two columns (often two steps)      |
| `matter`   | Alias for `columns` (why / what-breaks)    |
| `recap`    | Title + three recap cards                  |
| _(none)_   | Falls back to `lead`-like body             |

### Accent / fill

| Token      | Use                          |
| ---------- | ---------------------------- |
| `purple`   | Accent + progress            |
| `lime`     | Accent; break/cta fill       |
| `orange`   | Accent; break/cta fill       |
| `lavender` | Break fill (ink-on-lavender) |

### Motion tokens

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
| `blur-in`       | Fade in through blur               |
| `flip-x`        | Flip in on the Y axis              |
| `flip-y`        | Flip in on the X axis              |
| `spin-in`       | Slight rotate + scale in           |

### Reveal rules (on molecules)

| Attrs                         | Behavior                             |
| ----------------------------- | ------------------------------------ |
| `step` (+ optional motion)    | Each list item is its own reveal     |
| motion only (`reveal-bottom`) | Whole molecule arrives as one reveal |
| neither                       | Visible immediately                  |

Default motion when omitted on a step: `fade`.

### Prose conventions inside a slide

- First paragraph that is only emphasis (`*kicker*` or `_kicker_`) → section kicker
- `#` / `##` → slide title
- Following paragraphs → body / lede

---

## Molecules (`:::name[…]`)

### `:::cards[stack|row]`

Card grid from a markdown list. Each item: `**Title** — body`.

```markdown
:::cards[stack step reveal-bottom]

- **Direction** — Where the team landed, and how
- **Options tried** — What was attempted and ruled out
  :::
```

- `stack` — vertical stack (default)
- `row` — horizontal row
- `step` (or `stagger`) — each card is its own reveal
- motion alone — whole grid as one reveal (`:::cards[row reveal-bottom]`)

### `:::letters`

Letter tiles. List items: `V — Vision`.

```markdown
:::letters[step reveal-bottom]

- V — Vision
- I — Intent
- B — Boundary
- E — Execute
- S — Stability
  :::
```

### `:::altitude`

Altitude rows. List items: `**30,000 ft** — Why — the problem…`.

```markdown
:::altitude[step reveal-bottom]

- **30,000 ft** — Why — the problem solved
- **Ground level** — Code, tests, implementation
  :::
```

### `:::col[accent]`

One column of markdown (heading + list). Used on `columns` / `matter` slides.
Put motion on the col — no outer `::::step`.

```markdown
:::col[purple reveal-left]

### Five rules

- One complete thought per document
  :::
```

Accents: `purple` | `lime` | `orange` | `lavender`

### `:::recap`

Recap cards from a list. Accents assigned in order: purple → lime → orange → lavender.

```markdown
:::recap[reveal-bottom]

- **Explanation** — Documentation as decision capture, by altitude
- **Execution** — Boundary clarity, complexity hidden
- **Expectation** — Tests as specification
  :::
```

`:::recap[step reveal-bottom]` reveals each card in turn.

### `:::pills`

Chip row on color breaks. List items become pills.

```markdown
:::pills

- Explanation
- Execution
- Expectation
  :::
```

### `:::callout[important|note|warn]`

Art-direction callout. Motion on the callout is enough:

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

Only needed for plain markdown or grouping several molecules into one reveal:

```markdown
::::step[fade]
A paragraph that should arrive on advance.

And another.
::::
```

---

## Adding a molecule

1. Teach [`parse.ts`](../src/lib/proto/talks/parse.ts) the `:::name` container.
2. Add [`src/components/talk/molecules/Name.astro`](../src/components/talk/molecules/) and wire it in [`Block.astro`](../src/components/talk/Block.astro).
3. Style it in [`talk.css`](../src/styles/talk.css).
4. Document it here.

No new npm package required — fences map to components.

---

## Hub shelf

Hub Talks row reads [`src/data/talks.ts`](../src/data/talks.ts). To add a talk:

1. Drop `src/content/talks/your-slug.md` — the page is auto-generated at `/proto/talks/your-slug` via [`[slug].astro`](../src/pages/proto/talks/[slug].astro).
2. Add a shelf entry in `src/data/talks.ts` for the hub row.
