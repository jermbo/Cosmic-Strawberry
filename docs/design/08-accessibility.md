# 08 — Accessibility

**Source of truth:** `src/layouts/Proto.astro`, `src/lib/proto/*`, `src/styles/proto.css`
**Audited against:** WCAG 2.2 AA

The hub deck is the hard case: a fixed, non-scrolling surface that moves under
fixed chrome. Everything below came out of auditing it, and most of it applies
to the whole prototype.

## Rules

### A visual model may not become the content model

The deck shows one cell at a time. It used to *expose* one cell at a time:
`aria-hidden="true"` on every row that was not in view, and `tabindex="-1"` on
every control inside them. Fifteen of sixteen items did not exist for a screen
reader.

Nothing is hidden now, and nothing is pulled out of the tab order. Focus moves
freely through all sixteen cells, and the `focusin` handler brings whatever
receives focus into view. The visual follows the reader instead of gating them.

### Motion may not eat the semantics

Two effects were quietly destroying meaning:

- `SplitText`'s line masks are `aria-hidden`, which left every masked headline
  with no accessible name. `maskLines()` restores it.
- `DrawSVG` writes `stroke-dasharray` inline, which outranks the stylesheet and
  left every drawn `.ln--dash` solid. `drawFigure()` clears it on complete.

Any new effect that rewrites an ARIA-relevant attribute or a semantic style owes
the same repair.

### The browser's own controls are never taken

| Control | Rule |
|---------|------|
| Ctrl+wheel zoom | The deck's wheel handler returns before `preventDefault()` |
| Pinch zoom | `touch-action: pinch-zoom`, never `none` |
| Text zoom | Cells scroll internally when content outgrows them; the wheel yields only to real overflow containers, not transform-sized ancestors like `.deck__world` |
| System pointer | The drawn cursor is disabled under `prefers-reduced-motion` |
| Arrow keys | The deck answers only when focus is loose or inside it |

### Contrast is a floor, not a mood

`--fg-faint` was 30% ink on cream and 32% cream on ink: **1.98:1** and
**2.52:1**. It carries real text — section names, counters, spec labels. It is
now 58% and 50%, which measure **4.78:1** and **4.69:1**.

`.mono-sm` was 10px. It is 12px.

Quiet is achieved with size, weight and space. It is not achieved by taking the
text below the point where it can be read.

## Structure

- One `<h1>` per page, `<h2>` per deck section (visually hidden), `<h3>` per
  item. The deck had exactly one heading before this and fifteen untitled items.
- Skip link to `#main`, first in the tab order.
- The deck is `role="region"`, `tabindex="0"`, with an `aria-label` naming its
  keys. A bare `<div>` with `aria-label` is ignored.
- The section rail is a `<nav>` with a list, and each button names the row it
  controls with `aria-controls`.
- Arrow glyphs inside link text are `aria-hidden`; external links say
  "opens in a new tab" in an `.sr` span.
- One `role="status"` region announces each move, plus an `.sr` paragraph
  stating the key bindings.

## Reduced motion

A designed state, not a fallback. Stripes set, rules at full width, figures at
full opacity, the drawn cursor off, transitions clamped to 0.001ms. Nothing is
left hidden waiting for a trigger that will never fire — the reveal system
starts from `opacity: 0`, so this is a correctness requirement.

## Known gaps

- Reading a cell that is not in view is possible but the deck does not follow
  the virtual cursor, only real focus. Screen-reader browse mode can therefore
  read ahead of what is on screen.
- The deck has no visible "you are here" for the item index below 900px; the
  rail is hidden at that width.
