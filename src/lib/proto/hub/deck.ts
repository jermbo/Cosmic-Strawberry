/**
 * The 2D deck behind hub options 06 and 08.
 *
 *   left / right  →  items inside a section
 *   up   / down   →  section to section
 *
 * Every cell fills the viewport and nothing scrolls: the world is translated
 * under fixed chrome, which is what lets the chrome stay genuinely still.
 * Each row remembers its own column, so leaving a section and coming back
 * puts you where you were.
 *
 * All motion is transitional. Nothing here starts on a timer.
 */
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { drawFigure } from "../reveal";

gsap.registerPlugin(ScrambleTextPlugin);

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/*
 * Travel past the first or last item, with diminishing returns that asymptote
 * at `RUBBER_MAX` of the span. A flat resistance factor still let you drag the
 * edge clean off the screen if you kept pulling; past the end is a hint that
 * there is nothing there, not somewhere you get to go.
 */
function rubber(delta: number, span: number): number {
	const max = span * RUBBER_MAX;
	const pull = delta * RUBBER;
	return pull / (1 + Math.abs(pull) / max);
}

/** Travel before a drag commits to an axis. */
const SLOP = 8;
/** Fraction of a cell you must drag before release advances. */
const COMMIT = 0.22;
/** px/ms that counts as a flick regardless of distance. */
const FLICK = 0.45;
/** Wheel input ignored for this long after a move, so momentum can't overrun. */
const COOLDOWN = 380;
/** Wheel travel needed to trigger a move from a standing start. */
const WHEEL_THRESHOLD = 40;
/** Resistance applied to travel past the first or last item. */
const RUBBER = 0.35;
/** Hard ceiling on that travel, as a fraction of the span. Past the end is a hint, not a place. */
const RUBBER_MAX = 0.1;

const EASE = "expo.out";
const DUR = 0.78;

/** Glyph set the ghost word resolves out of. Matches the landing-page boot. */
const GLYPHS = "01!<>-_\\/[]{}=+*^?#";

type Axis = "x" | "y";

export interface DeckOptions {
	/**
	 * Play the arrival tween for the starting cell. Pages that run their own
	 * load sequence turn this off so the boot is one timeline rather than two
	 * competing ones; every later move still animates normally.
	 */
	intro?: boolean;
	/**
	 * Draw each row's line-work the first time that row is entered, rather
	 * than having it present from the start. Off by default: pages that route
	 * through `initReveals()` already own their figures.
	 */
	drawFigures?: boolean;
	/**
	 * Resolve each cell's ghost word out of noise on arrival instead of having
	 * it simply be there. The ghost is the largest thing on screen, so this is
	 * the difference between it participating in a move and being swapped.
	 */
	scrambleGhost?: boolean;
	/**
	 * Pointer dragging. `true` for any pointer, `false` for none, `"touch"` for
	 * touch only. Mouse dragging competes with the wheel and the arrow keys for
	 * the same job; on a phone there is no wheel and no arrow keys, so the
	 * swipe is the only continuous way to move and cannot be given up.
	 */
	drag?: boolean | "touch";
}

export function initDeck(opts: DeckOptions = {}): void {
	const { intro = true, drawFigures = false, scrambleGhost = false, drag = true } = opts;

	const deck = document.querySelector<HTMLElement>("[data-deck]");
	if (!deck) return;

	const world = deck.querySelector<HTMLElement>("[data-world]");
	const rows = Array.from(deck.querySelectorAll<HTMLElement>("[data-row]"));
	if (!world || !rows.length) return;

	const cellsOf = (r: number) => Array.from(rows[r].querySelectorAll<HTMLElement>("[data-cell]"));

	/*
	 * Readouts live either inside the deck (06, chrome floating over the
	 * cells) or on an enclosing frame (08, where the chrome *is* the frame).
	 */
	const scope = deck.closest<HTMLElement>("[data-frame]") ?? deck;

	const elIndex = scope.querySelector<HTMLElement>("[data-rail-index]");
	const elTotal = scope.querySelector<HTMLElement>("[data-rail-total]");
	const elSection = scope.querySelector<HTMLElement>("[data-rail-section]");
	const elSectionNum = scope.querySelector<HTMLElement>("[data-rail-section-num]");
	const elStatus = scope.querySelector<HTMLElement>("[data-status]");
	const elProgress = scope.querySelector<HTMLElement>("[data-progress]");
	const dots = Array.from(scope.querySelectorAll<HTMLButtonElement>("[data-section-dot]"));
	const live = Array.from(scope.querySelectorAll<HTMLElement>("[data-live]"));
	const liveRoot = scope.querySelector<HTMLElement>("[data-live-root]");

	let row = 0;
	const cols = rows.map(() => 0);
	let lastMoveAt = 0;

	const dur = () => (reduced() ? 0 : DUR);

	/* ---------------------------------------------------------------- geometry */

	/**
	 * Cells are narrower than the deck and are *centred*, not left-aligned —
	 * centring is what puts a neighbour in each margin, which is the only
	 * affordance telling you there is somewhere else to go.
	 */
	function targetX(r: number): number {
		const cell = cellsOf(r)[cols[r]];
		if (!cell) return 0;
		return -cell.offsetLeft + (deck.clientWidth - cell.offsetWidth) / 2;
	}

	const targetY = () => -row * deck.clientHeight;

	/* ---------------------------------------------------------------- painting */

	function paint(): void {
		const cells = cellsOf(row);
		const col = cols[row];
		const active = cells[col];

		/*
		 * Nothing is hidden from assistive technology and nothing is pulled out
		 * of the tab order. Hiding the fifteen cells that were not in view made
		 * the deck a one-item page for a screen reader. Every cell stays
		 * readable and focusable, and the `focusin` handler below brings
		 * whatever gets focus into view, so the visual follows the reader
		 * rather than gating it.
		 */
		rows.forEach((r, i) => {
			r.classList.toggle("is-active-row", i === row);

			cellsOf(i).forEach((c, n) => {
				c.classList.toggle("is-active", i === row && n === col);
			});
		});

		if (elIndex) elIndex.textContent = String(col + 1).padStart(2, "0");
		if (elTotal) elTotal.textContent = String(cells.length).padStart(2, "0");
		if (elSection) elSection.textContent = rows[row].dataset.section ?? "";
		if (elSectionNum) elSectionNum.textContent = rows[row].dataset.num ?? "";

		dots.forEach((d, i) => {
			d.classList.toggle("is-current", i === row);
			d.setAttribute("aria-current", i === row ? "true" : "false");
		});

		if (elProgress) {
			gsap.to(elProgress, {
				scaleX: (col + 1) / cells.length,
				duration: reduced() ? 0 : 0.6,
				ease: "power3.out",
				overwrite: true,
			});
		}

		deck.dataset.accent = active?.dataset.accent ?? "";

		/* option 08 keeps its copy in the frame, so the frame must be told */
		if (active) {
			live.forEach((el) => {
				const key = el.dataset.live;
				if (key) el.textContent = active.dataset[key] ?? "";
			});
			if (liveRoot) liveRoot.dataset.accent = active.dataset.accent ?? "";
		}

		/* one polite announcement per move, for anyone not watching it happen */
		if (elStatus && active) {
			elStatus.textContent = `${rows[row].dataset.section ?? ""}, ${col + 1} of ${
				cells.length
			}: ${active.dataset.title ?? active.textContent?.trim().slice(0, 60) ?? ""}`;
		}
	}

	/* --------------------------------------------------------------- animation */

	/**
	 * Line-work draws itself the first time a row comes into view — the whole
	 * row at once, not just the active cell, because the neighbours peeking in
	 * at the margins would otherwise be visibly blank panels.
	 */
	function drawRow(r: number): void {
		if (!drawFigures) return;
		const el = rows[r];
		if (el.dataset.drawn === "true") return;
		el.dataset.drawn = "true";

		const figs = Array.from(el.querySelectorAll<HTMLElement>("[data-fig]"));
		if (!figs.length) return;

		if (reduced()) {
			figs.forEach((f) => (f.style.opacity = "1"));
			return;
		}

		figs.forEach((f, i) => drawFigure(f, i * 0.09));
	}

	/**
	 * The arrival. Layers land at different rates — ghost word slowest, panel
	 * next, copy last — which is what reads as depth without anything
	 * literally moving in Z.
	 */
	function arrive(dir: number, axis: Axis = "x"): void {
		drawRow(row);
		if (reduced()) return;

		const cell = cellsOf(row)[cols[row]];
		if (!cell) return;

		const ghost = cell.querySelector<HTMLElement>("[data-ghost]");
		const panel = cell.querySelector<HTMLElement>("[data-panel]");
		const lines = cell.querySelectorAll<HTMLElement>("[data-line]");
		const d = dir || 1;

		/*
		 * The offset is applied along whichever axis you actually travelled.
		 * Moving between sections used to slide the whole cell as one plane;
		 * running the same ghost/panel/copy ratios vertically is what gives the
		 * section change the depth the horizontal move already had.
		 */
		/*
		 * Both axes are always written, not just the one you travelled. With
		 * `overwrite: true` a vertical arrival kills an in-flight horizontal one
		 * wherever it happens to be, and that leftover offset never resolves —
		 * naming both axes makes the resting state unconditional.
		 */
		const at = (n: number) => ({ x: axis === "x" ? d * n : 0, y: axis === "y" ? d * n : 0 });
		const home = { x: 0, y: 0 };

		if (ghost) {
			gsap.fromTo(
				ghost,
				at(110),
				{ ...home, duration: 1.25, ease: EASE, overwrite: true }
			);

			/* the word resolves out of noise rather than simply being the next word */
			const word = ghost.querySelector<HTMLElement>("[data-par]") ?? ghost;

			/*
			 * The target text is cached on first sight and never re-read. Reading
			 * it live meant a second arrival landing mid-scramble captured the
			 * noise as its destination and the word stayed garbage for good.
			 */
			if (word.dataset.word === undefined) word.dataset.word = word.textContent ?? "";
			const target = word.dataset.word;

			if (scrambleGhost && target) {
				gsap.to(word, {
					duration: 0.7,
					ease: "none",
					overwrite: "auto",
					scrambleText: { text: target, chars: GLYPHS, speed: 0.55, revealDelay: 0.12 },
				});
			}
		}

		if (panel) {
			gsap.fromTo(panel, at(44), { ...home, duration: 1, ease: EASE, overwrite: true });
		}

		if (lines.length) {
			gsap.fromTo(
				lines,
				{ opacity: 0, y: 20 },
				{
					opacity: 1,
					y: 0,
					duration: 0.65,
					ease: "power3.out",
					stagger: 0.06,
					delay: 0.1,
					overwrite: true,
				}
			);
		}
	}

	/* ------------------------------------------------------------------ moving */

	/**
	 * Tweens are never blocked and never queued — a new one simply retargets
	 * the old, so spinning the wheel feels like steering rather than like
	 * waiting your turn.
	 */
	function settle(dir = 0, viaKeyboard = false, axis: Axis = "x"): void {
		const d = dur();

		gsap.to(world, { y: targetY(), duration: d, ease: EASE, overwrite: true });

		rows.forEach((r, i) => {
			if (i === row) {
				gsap.to(r, { x: targetX(i), duration: d, ease: EASE, overwrite: true });
			} else {
				/* off-screen rows can jump; nobody is looking */
				gsap.set(r, { x: targetX(i) });
			}
		});

		publishTravel();
		paint();
		drawRow(row);

		/*
		 * Only a real move animates. `dir === 0` is a spring back from a drag
		 * that did not commit — the cell is already where it belongs, so
		 * replaying its arrival makes an aborted gesture look like a reload.
		 */
		if (dir !== 0) arrive(dir, axis);
		if (viaKeyboard) focusActive();
		lastMoveAt = performance.now();
		deck.dispatchEvent(new CustomEvent("deck:move"));
	}

	/*
	 * How far the world has travelled, published rather than applied — the same
	 * bargain as `--lean`. Anything that wants to parallax against the move
	 * (the construction grid does) reads these and picks its own rate.
	 */
	function publishTravel(): void {
		deck.style.setProperty("--travel-x", `${targetX(row)}px`);
		deck.style.setProperty("--travel-y", `${targetY()}px`);
	}

	/** Returns false when the move was refused — you are already at that end. */
	function goCol(delta: number, viaKeyboard = false): boolean {
		const max = cellsOf(row).length - 1;
		const next = clamp(cols[row] + delta, 0, max);
		if (next === cols[row]) return false;
		cols[row] = next;
		settle(delta > 0 ? 1 : -1, viaKeyboard, "x");
		return true;
	}

	function goRow(delta: number, viaKeyboard = false): boolean {
		const next = clamp(row + delta, 0, rows.length - 1);
		if (next === row) return false;
		row = next;
		cols[row] = clamp(cols[row], 0, cellsOf(row).length - 1);
		settle(delta > 0 ? 1 : -1, viaKeyboard, "y");
		return true;
	}

	function goTo(r: number, c = 0, viaKeyboard = false): void {
		const dir = r > row ? 1 : -1;
		row = clamp(r, 0, rows.length - 1);
		cols[row] = clamp(c, 0, cellsOf(row).length - 1);
		settle(dir, viaKeyboard, "y");
	}

	function focusActive(): void {
		const cell = cellsOf(row)[cols[row]];
		if (!cell) return;
		const target =
			cell.querySelector<HTMLElement>("[data-launch]") ??
			(cell.matches("a, button") ? cell : cell.querySelector<HTMLElement>("a, button"));
		target?.focus({ preventScroll: true });
	}

	/* ------------------------------------------------------------------- wheel */

	let accX = 0;
	let accY = 0;
	let idle = 0;

	/**
	 * Can anything between the pointer and the deck still scroll this way? If so
	 * the wheel belongs to it, not to the deck. This is what lets a cell whose
	 * content is taller than the viewport — a zoomed-in masthead — be read.
	 */
	function scrollableUnder(target: Element | null, dy: number): boolean {
		let el: Element | null = target;
		while (el && el !== deck) {
			const room = el.scrollHeight - el.clientHeight;
			if (room > 1) {
				const top = el.scrollTop;
				if (dy > 0 ? top < room - 1 : top > 1) return true;
			}
			el = el.parentElement;
		}
		return false;
	}

	deck.addEventListener(
		"wheel",
		(e) => {
			/* Ctrl+wheel is the browser's zoom. It is never ours to take. */
			if (e.ctrlKey) return;

			/* neither is a scroll that something under the pointer can still use */
			if (scrollableUnder(e.target as Element, e.deltaY)) return;

			e.preventDefault();

			/* swallow the momentum tail rather than surfing three cells on one flick */
			if (performance.now() - lastMoveAt < COOLDOWN) {
				accX = accY = 0;
				return;
			}

			accX += e.deltaX;
			accY += e.deltaY;

			if (Math.abs(accX) > Math.abs(accY)) {
				if (Math.abs(accX) > WHEEL_THRESHOLD) {
					goCol(accX > 0 ? 1 : -1);
					accX = accY = 0;
				}
			} else if (Math.abs(accY) > WHEEL_THRESHOLD) {
				goRow(accY > 0 ? 1 : -1);
				accX = accY = 0;
			}

			clearTimeout(idle);
			idle = window.setTimeout(() => {
				accX = accY = 0;
			}, 160);
		},
		{ passive: false }
	);

	/* ---------------------------------------------------------------- keyboard */

	const typing = (el: EventTarget | null) =>
		el instanceof HTMLElement &&
		(el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

	window.addEventListener("keydown", (e) => {
		if (typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;

		/*
		 * The deck used to answer arrow keys from anywhere on the page, so
		 * tabbing to the nav and pressing Down still moved it. It now answers
		 * only when nothing is focused or when focus is inside the deck.
		 */
		const focused = document.activeElement;
		const loose = !focused || focused === document.body;
		if (!loose && !deck.contains(focused)) return;

		/* space belongs to whatever control has focus, not to the deck */
		const onControl =
			e.target instanceof Element && e.target.closest("button, a") && !(e.target as Element).closest("[data-cell]");
		if (e.key === " " && onControl) return;

		const last = cellsOf(row).length - 1;
		const moves: Record<string, () => void> = {
			ArrowRight: () => goCol(1, true),
			ArrowLeft: () => goCol(-1, true),
			ArrowDown: () => goRow(1, true),
			ArrowUp: () => goRow(-1, true),
			PageDown: () => goRow(1, true),
			PageUp: () => goRow(-1, true),
			Home: () => goTo(row, 0, true),
			End: () => goTo(row, last, true),
			" ": () => goCol(e.shiftKey ? -1 : 1, true),
		};

		const fn = moves[e.key];
		if (!fn) return;
		e.preventDefault();
		fn();
	});

	/* tabbing into an off-screen cell brings it along */
	rows.forEach((r, i) => {
		cellsOf(i).forEach((cell, n) => {
			cell.addEventListener("focusin", () => {
				if (i !== row || n !== cols[i]) goTo(i, n);
			});
		});
	});

	/* -------------------------------------------------------------------- drag */

	let dragging = false;
	let axis: "x" | "y" | null = null;
	let startX = 0;
	let startY = 0;
	let baseX = 0;
	let baseY = 0;
	let lastPos = 0;
	let lastAt = 0;
	let velocity = 0;
	let moved = 0;

	/*
	 * Drag energy, published as a CSS custom property rather than applied
	 * directly, so the page decides what leans and this file stays generic.
	 * Nothing here may write transforms the play layer also writes.
	 */
	const lean = { value: 0 };
	const setLean = () => deck.style.setProperty("--lean", lean.value.toFixed(3));

	const isControl = (t: EventTarget | null) =>
		t instanceof Element && !!t.closest("button, [data-no-drag]");

	const dragAccepts = (e: PointerEvent) =>
		drag === true || (drag === "touch" && e.pointerType === "touch");

	deck.addEventListener("pointerdown", (e) => {
		if (e.button !== 0 || !dragAccepts(e) || isControl(e.target)) return;

		dragging = true;
		axis = null;
		moved = 0;
		startX = lastPos = e.clientX;
		startY = e.clientY;
		baseX = (gsap.getProperty(rows[row], "x") as number) || 0;
		baseY = (gsap.getProperty(world, "y") as number) || 0;
		lastAt = performance.now();
		velocity = 0;

		deck.setPointerCapture(e.pointerId);
		deck.classList.add("is-dragging");
	});

	deck.addEventListener("pointermove", (e) => {
		if (!dragging) return;

		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));

		if (!axis) {
			if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return;
			axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
		}

		const now = performance.now();
		const pos = axis === "x" ? e.clientX : e.clientY;
		const dt = now - lastAt;
		if (dt > 0) velocity = (pos - lastPos) / dt;
		lastPos = pos;
		lastAt = now;

		lean.value = clamp(velocity * 0.55, -1, 1);
		setLean();

		/* the world tracks the pointer 1:1, with capped resistance past the ends */
		if (axis === "x") {
			const max = cellsOf(row).length - 1;
			const beyond = (cols[row] === 0 && dx > 0) || (cols[row] === max && dx < 0);
			const span = cellsOf(row)[cols[row]]?.offsetWidth ?? deck.clientWidth;
			gsap.set(rows[row], { x: baseX + (beyond ? rubber(dx, span) : dx) });
		} else {
			const beyond = (row === 0 && dy > 0) || (row === rows.length - 1 && dy < 0);
			gsap.set(world, { y: baseY + (beyond ? rubber(dy, deck.clientHeight) : dy) });
		}
	});

	function endDrag(e: PointerEvent): void {
		if (!dragging) return;
		dragging = false;
		deck.classList.remove("is-dragging");
		if (deck.hasPointerCapture(e.pointerId)) deck.releasePointerCapture(e.pointerId);

		gsap.to(lean, {
			value: 0,
			duration: 0.9,
			ease: "elastic.out(1, 0.5)",
			onUpdate: setLean,
			overwrite: true,
		});

		if (!axis) return;

		const travelled = axis === "x" ? e.clientX - startX : e.clientY - startY;
		const span = axis === "x" ? cellsOf(row)[cols[row]]?.offsetWidth ?? 1 : deck.clientHeight;
		const past = Math.abs(travelled) / span > COMMIT;
		const flicked = Math.abs(velocity) > FLICK;

		const back = travelled > 0;

		/*
		 * A committed drag at either end used to return out of `goCol`/`goRow`
		 * without settling, which left the world parked wherever the pointer
		 * was released — permanently, at any of the four edges. A refused move
		 * still owes you the spring back.
		 */
		const moved =
			past || flicked ? (axis === "x" ? goCol(back ? -1 : 1) : goRow(back ? -1 : 1)) : false;

		if (!moved) settle(0, false, axis);

		axis = null;
	}

	deck.addEventListener("pointerup", endDrag);
	deck.addEventListener("pointercancel", (e) => {
		dragging = false;
		axis = null;
		deck.classList.remove("is-dragging");
		if (deck.hasPointerCapture(e.pointerId)) deck.releasePointerCapture(e.pointerId);
	});

	/* a drag that finishes on a link must not follow it */
	deck.addEventListener(
		"click",
		(e) => {
			if (moved > SLOP) {
				e.preventDefault();
				e.stopPropagation();
			}
		},
		true
	);

	/* anchors and figures have native drag behaviour that eats the gesture */
	deck.addEventListener("dragstart", (e) => e.preventDefault());

	/* ------------------------------------------------------------------ resize */

	let frame = 0;
	window.addEventListener("resize", () => {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(() => {
			gsap.set(world, { y: targetY() });
			rows.forEach((r, i) => gsap.set(r, { x: targetX(i) }));
			publishTravel();
		});
	});

	/* -------------------------------------------------------------- controls */

	scope.querySelector("[data-go-prev]")?.addEventListener("click", () => goCol(-1));
	scope.querySelector("[data-go-next]")?.addEventListener("click", () => goCol(1));
	scope.querySelector("[data-go-down]")?.addEventListener("click", () => goRow(1));
	dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i, cols[i])));

	/* ----------------------------------------------------------------- start */

	gsap.set(world, { y: targetY() });
	rows.forEach((r, i) => gsap.set(r, { x: targetX(i) }));
	publishTravel();
	paint();

	/*
	 * The intro tween starts the copy at zero opacity. In a background tab
	 * rAF is throttled, so that tween would not run and the copy would sit
	 * invisible until the tab was focused — skip it and keep the CSS default.
	 */
	if (!intro) {
		/* the page's own load owns the first arrival; still paint the readouts */
		return;
	}

	if (document.visibilityState === "visible") arrive(1);
	else drawRow(row);
}
