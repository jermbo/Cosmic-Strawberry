# Plan — Hub Architecture

**Status:** planning · **Opened:** 2026-08-22 · **Branch:** `feature/something-fun`

## The problem

`/proto` proved the visual language. It did not answer the structural
question: **this site is a hub.** It has to hold four live projects (with more
coming), a body of writing, and a shelf of one-off experiments — and it has to
still make sense when there are twelve projects instead of four.

Nothing on `/proto` today is load-bearing for that. Crossings is placeholder
content standing in for writing. Projects have no home at all.

So: explore the information architecture before committing to a home page.

## What we are NOT doing yet

- Not touching `/proto` or the existing landing page. Both stay as they are.
- Not writing per-project animations. That is Phase 3, after a layout wins.
- Not picking final copy. Placeholder blurbs from the real descriptions.
- Not adding packages. Astro + raw CSS + the existing `proto.css`.

---

## The content

Three types. An About/Now page was considered and cut — the hub speaks for itself.

### Projects (external, subdomains)

| # | Project | URL | What it is |
|---|---------|-----|-----------|
| 01 | View Source | `viewsource.cosmicstrawberry.com` | An exploration of how to get AI not to suck at design, by starting with the history of design. |
| 02 | Typer | `typer.cosmicstrawberry.com` | A reimagined and modernised tool from the Code Palm Beach days. |
| 03 | Astra Opus | `astra-opus.cosmicstrawberry.com` | An exploration of creativity in the age of AI. |
| 04 | Workout | `workout.cosmicstrawberry.com` | A custom workout app, habit and activity tracker, and health monitor. Installable PWA, works offline. |

Every option must survive a fifth, sixth, and twelfth entry without a redesign.
That is the hardest constraint in this document.

### Writing (internal)

Essays, teardowns, field notes. `Crossings` is the working name and the
existing essay page (`/proto/crossings/hard-vacuum`) is the target shape.

### Lab (internal, small)

The animation studies in `docs/ideas/` — worth showing, not worth calling
projects. Small demos, one per page, no long-form text.

---

## Phase 1 — IA options (this phase)

Four low-fidelity pages, one per direction, each answering *"how does a
visitor find the four things?"* differently.

**Fidelity rule:** reuse `proto.css` — real type, real colour, real stripes,
real schematic marks — so the options are comparable to the page we already
like. **No GSAP, no reveal, no stagger, no per-project motion.** Structure is
what is being judged; motion would only flatter a weak layout.

### Routes

```
/proto/hub/option-1   Mission control board
/proto/hub/option-2   Single-scroll manifest
/proto/hub/option-3   Docking bay (hub-and-spoke)
/proto/hub/option-4   Constellation (spatial map)
/proto/hub            Index — the four options side by side, with notes
```

### The five directions

**Option 1 — Mission control board.**
Everything visible at once, one screen, no scroll. Projects are instrument
panels in a grid; writing is a ticker along one edge; lab is a strip of small
readouts. Dense and immediate. *Risk:* density has a ceiling — the twelfth
project breaks the single screen.

**Option 2 — Single-scroll manifest.**
One long vertical document. Hero → Projects (the main event) → Writing → Lab →
foot. Closest to `/proto`'s existing rhythm and the safest to extend forever.
*Risk:* safe. Nothing about it is a reason to visit.

**Option 3 — Docking bay (hub-and-spoke).**
The hub is nearly empty — a large schematic with three ports: Projects,
Writing, Lab. Each port is its own page with its own index. Scales best; makes
the home page a decision rather than a scroll. *Risk:* an empty front door asks
the visitor to work before they are sold.

**Option 4 — Constellation (spatial map).**
Projects positioned in 2D space, pan and zoom, connections drawn between
related work. Granted a motion exception, since a constellation that does not
move is a scatter plot. *Risk:* spatial navigation is easy to make beautiful
and hard to make usable.

**Option 5 — Orbital field.** *(added after the reference pass — see below)*
Projects travel elliptical paths around a core and cross in front of and
behind the wordmark. Depth carried by scale, stroke weight and stacking order.
Motion is not an exception here, it is the whole proposition. *Risk:* if the
orbit reads as decoration rather than structure, it collapses into a slow
carousel.

### Shared groundwork (build first)

1. `src/data/projects.ts` — the four projects as typed data: `idx`, `name`,
   `href`, `blurb`, `status`, `tags`. Every option renders from this one
   source, so adding a project is a data edit, not four page edits.
2. `src/data/writing.ts`, `src/data/lab.ts` — same shape, placeholder entries.
3. `src/components/hub/ProjectCard.astro` — one presentational component per
   option is fine; shared only where the options genuinely agree.
4. `src/pages/proto/hub/index.astro` — the compare page, with each option's
   thesis and known risk written out.
5. Nav: add a `HUB` link to `Proto.astro` so the options are reachable.

### How we decide

Judge each option against, in order:

1. **Twelve-project test** — does it still work at 3× the content?
2. **Does the project or the layout lead?** A hub whose chrome outshines the
   work it points at has failed.
3. **Where does writing sit** without becoming a second-class citizen?
4. **Does it want motion, or merely tolerate it?** Phase 3 is easier if the
   winner has obvious places for animation to live.
5. **Is there a Z-axis?** Added after the reference pass. Options 01–04 are all
   flat documents wearing good chrome; that flatness is the thing that read as
   "safe".

Outcome: one winner, or an explicit hybrid ("Option 2's spine, Option 1's
project tiles"). Recorded at the bottom of this file.

---

## Phase 2 — Build the winner

High-fidelity pass on the chosen direction. Real copy, responsive down to
mobile, theme-correct in both modes, keyboard reachable. Still no per-project
animation beyond the existing reveal/stagger primitives.

Ends when the hub could ship as-is with no motion at all. That is the bar:
motion is an enhancement, never the load-bearing wall.

---

## Phase 3 — Per-project animation

One signature move per project, drawn from what the project actually is:

- **View Source** — something that peels the surface to show the markup under it.
- **Typer** — type that assembles character by character.
- **Astra Opus** — generative line-work, no two loads identical.
- **Workout** — a trace or a rhythm, something that reads as measurement.

Rules: `prefers-reduced-motion` kills all of it; nothing animates that is not
in the viewport; each move is a self-contained module in `src/lib/proto/hub/`
so a new project ships with its own file and touches nothing else.

Sequenced one project at a time, in the order above.

---

## Phase 4 — Capture

Per the standing practice: the hub's patterns land in `docs/design/` and on the
live kit page at `/proto/kit`, not just in the page source. New marks, new
components, new motion moves all get documented where the next person looks.

---

## Decision log

_(empty — Phase 1 outcome goes here)_

---

## Reference pass — 2026-08-22

Options 01–04 built and reviewed. Verdict: **safe, not wrong.** Three of the
four are the same idea — a list of things in a grid — with the layout varying
and the experience not. The deeper fault was representational: a project was
rendered as *a paragraph about the project* rather than an encounter with it.

Two references settled the direction, and they split cleanly by job:

**[Tech Valley](https://dribbble.com/shots/25274497-Tech-Valley-Web3-and-Crypto-Platform)
— the motion grammar.** Orbit paths crossing in front of and behind a core,
real Z-depth, masked line-by-line type reveals. Its *surface* — glow, gradient
washes, metallic 3D — is explicitly banned by
[design intent](../design/01-design-intent.md) and by
[colour](../design/02-colour.md), and adopting it would overturn the constraint
that makes `/proto` good. Taking only the motion grammar costs nothing.

**[Marcato](https://dribbble.com/shots/8071472-Space-Themed-Website-Design-and-Animation)
— the texture.** Monochrome engraved line-work on flat ground, display type
living *inside* the illustration instead of above it, subtle parallax. Already
close to this system's language; `SchemaMark` is the same instinct at lower
density. Its cost is artwork, not engineering — the engravings are the design.

**What both have and 01–04 did not: a Z-axis.** That became criterion E.

## Decision log

**2026-08-22 — Option 5 (Orbital Field) selected.** Built at
`/proto/hub/option-5` with `src/lib/proto/hub/orbit.ts`. Projects derive their
orbit from their index, so a fifth project gets a path with no hand-placing.
GSAP + CSS transforms only; no new dependencies. Options 01–04 stay on disk as
the comparison that produced this.

Still unverified at time of writing: the motion has not been watched running.
The build is clean and the field renders, but the browser pane available in
this session suspends `requestAnimationFrame`, which freezes every GSAP
timeline — so the orbit, the parallax and the hover-hold are unconfirmed.

---

## Second reference pass — 2026-08-22

Option 05 rejected. The fault was named precisely: **ambient motion.** The
orbit ran perpetually, on its own, whether or not anyone asked — decorative,
unrelenting, impossible to un-see. Both new references have *zero* ambient
motion; everything in them is still until a person moves it, then it
transitions decisively and stops. That is now a standing rule, and it is what
[motion](../design/05-motion.md) was already saying.

Second fault, on option 01: **the count was structural.** Four projects
rendered as four equal panels in a 2×2 — the layout *is* a four-project
design, and a fifth breaks it. Equal boxes also flatten hierarchy, which is
what read as "plain".

**[DUB Studios](https://dribbble.com/shots/4629052-DUB-Studios-Animation)** —
one horizontal stream of deliberately unequal items at different vertical
offsets, mixed types (`article`, `study`) in the same channel, display type
breaking out past its card edge, ghosted wordmark behind, `01/05` on a rail.

**[Flor Keeps](https://dribbble.com/shots/20065954-animated-flowers)** — a
hairline frame dividing the viewport into bands and cells that never moves,
holding exactly one specimen at a time with supporting copy ranged into the
surrounding cells. Chrome constant, content variable.

### Settled scope

One page hub, **distinct sections** — not one undifferentiated stream. The
frame established on the hub is then inherited by internal pages (writing, and
anything else without its own subdomain), so the visual hierarchy carries
across the main site.

### Built

**First attempt rejected.** 06 and 07 were built as vertical scrolling
documents containing small widgets — a carousel component and a repeated
bordered card. Both references are *full-viewport experiences where movement
is the navigation*, and neither survives being shrunk into a component inside
a scrolling page. The failure was an unexamined assumption that "distinct
sections" meant "vertically stacked sections", plus a habit of abstracting a
reference into a principle instead of translating it.

Rebuilt as close translations. The movement, confirmed against four frames of
the DUB GIF: **left to right through items, top to bottom between sections.**
That maps directly onto the hub's IA.

| # | Name | Route | Movement |
|---|------|-------|----------|
| 06 | Deck | `/proto/hub/option-6` | Chrome fixed, world moves in 2D under it |
| 07 | Vitrine | `/proto/hub/option-7` | Frame fixed, one specimen at a time, tabs switch sections |
| 08 | Console | `/proto/hub/option-8` | Both: still frame, 2D world inside an aperture with cross-hairs |

All three fill the viewport and none of them scroll.

`src/lib/proto/hub/deck.ts` is the 2D controller shared by 06 and 08 — rows
are sections, columns are items, each row remembers its own column, and the
active cell is centred so its neighbours peek in from both margins. It takes
over the wheel, which is the reference's own bargain and the main cost of the
direction.

New criteria added from this pass: **F** is the count structural, **G**
ambient or transitional, **H** does the frame travel to internal pages.

All three tracks are real overflow containers with scroll snapping, so
trackpad, touch, shift-wheel and keyboard all work before any JavaScript runs.
Nothing hijacks the scroll.

---

## Option 06 selected — polish pass, 2026-08-22

`/proto/hub/option-6` is the direction. Refinements, all in
`src/lib/proto/hub/deck.ts` (still shared with 08) and the page's own styles.

**Transitions.** Tweens are no longer blocked or queued — a new move
retargets the running one via `overwrite`, so spinning the wheel steers
instead of waiting its turn. Eased `expo.out` at 0.78s. Wheel input is
swallowed for 380ms after a move so a trackpad's momentum tail cannot overrun
three cells on one flick.

**Keyboard.** Listener moved to `window`, so arrows work without hunting for
focus, and it stands down inside inputs and for modifier combos. Space belongs
to whatever control has focus rather than to the deck. Added Home/End for the
first and last item in a section. A move made with the keyboard focuses the
arriving cell. Off-screen cells are `tabindex="-1"`; tabbing into one brings
it along. Real focus rings on the deck and the cells — the previous
`outline: none` was a straight bug. A polite `role="status"` region announces
"Projects, 2 of 4: Typer", and a visually hidden paragraph documents the keys.

**Drag.** The whole viewport is the handle. The world now tracks the pointer
1:1 rather than only snapping on release, with 0.35 resistance past either
end. Axis locks after 8px, release commits on 22% of a cell *or* a flick above
0.45px/ms, and anything short springs back. Pointer capture keeps the gesture
alive outside the window, `dragstart` is cancelled so anchors and SVGs stop
eating it, and the surface is `user-select: none`.

**Animation.** Arrival is layered — ghost word slowest (1.25s), panel next
(1s), copy last on a 0.06s stagger — which reads as depth without anything
moving in Z. The bottom stripe doubles as a progress bar through the current
section. Nothing is ambient; every one of these is a consequence of a move.

The intro tween is skipped when the document is not visible, since a
background tab throttles rAF and would otherwise leave the copy invisible
until focus.

### Playful pass

**The launch zone shrank.** The cell used to *be* the anchor, which is what
made dragging feel broken — every gesture was a click on a link. The cell is
now a plain `div` and the only navigating element is a small bordered
`.launch` control. Everything else in the viewport is drag surface.

`src/lib/proto/hub/play.ts` holds the reactive layer, and it is reactive by
construction: it answers the pointer and rests when the pointer rests, so it
stays on the transitional side of the line option 05 crossed.

- **Parallax** — `[data-par]` layers in the active cell answer the pointer at
  different rates (ghost word 0.05, type column 0.018).
- **Magnet** — the launch control leans toward a cursor within 130px, up to
  14px of pull, scaled by proximity, and lights up before the cursor arrives.
- **Lean** — the deck publishes drag energy as a `--lean` custom property
  rather than writing transforms; the page decides what listens. Currently the
  schematic tilts and slides into the drag, springing back on release with
  `elastic.out`.

Ownership is split so the two files can never fight over a transform: the deck
owns `[data-ghost]`, `[data-panel]` and `[data-line]`; the play layer owns
`[data-par]` and `[data-magnet]`; `--lean` is consumed only in CSS.

The active-cell sets are recomputed on a `deck:move` event rather than per
pointer event — the first cut ran a `closest()` per layer and a layout read
per magnet on every mouse move, across all 15 cells.
