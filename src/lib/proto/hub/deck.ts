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

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

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

const EASE = "expo.out";
const DUR = 0.78;

export function initDeck(): void {
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

		rows.forEach((r, i) => {
			r.classList.toggle("is-active-row", i === row);
			r.setAttribute("aria-hidden", i === row ? "false" : "true");

			cellsOf(i).forEach((c, n) => {
				const on = i === row && n === col;
				c.classList.toggle("is-active", on);

				/* only the cell in view is reachable by tab */
				if (c.matches("a, button")) c.tabIndex = on ? 0 : -1;
				c.querySelectorAll<HTMLElement>("a, button").forEach((f) => {
					f.tabIndex = on ? 0 : -1;
				});
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
	 * The arrival. Layers land at different rates — ghost word slowest, panel
	 * next, copy last — which is what reads as depth without anything
	 * literally moving in Z.
	 */
	function arrive(dir: number): void {
		if (reduced()) return;

		const cell = cellsOf(row)[cols[row]];
		if (!cell) return;

		const ghost = cell.querySelector<HTMLElement>("[data-ghost]");
		const panel = cell.querySelector<HTMLElement>("[data-panel]");
		const lines = cell.querySelectorAll<HTMLElement>("[data-line]");
		const d = dir || 1;

		if (ghost) {
			gsap.fromTo(
				ghost,
				{ x: d * 110 },
				{ x: 0, duration: 1.25, ease: EASE, overwrite: true }
			);
		}

		if (panel) {
			gsap.fromTo(panel, { x: d * 44 }, { x: 0, duration: 1, ease: EASE, overwrite: true });
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
	function settle(dir = 0, viaKeyboard = false): void {
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

		paint();
		arrive(dir);
		if (viaKeyboard) focusActive();
		lastMoveAt = performance.now();
		deck.dispatchEvent(new CustomEvent("deck:move"));
	}

	function goCol(delta: number, viaKeyboard = false): void {
		const max = cellsOf(row).length - 1;
		const next = clamp(cols[row] + delta, 0, max);
		if (next === cols[row]) return;
		cols[row] = next;
		settle(delta > 0 ? 1 : -1, viaKeyboard);
	}

	function goRow(delta: number, viaKeyboard = false): void {
		const next = clamp(row + delta, 0, rows.length - 1);
		if (next === row) return;
		row = next;
		cols[row] = clamp(cols[row], 0, cellsOf(row).length - 1);
		settle(delta > 0 ? 1 : -1, viaKeyboard);
	}

	function goTo(r: number, c = 0, viaKeyboard = false): void {
		const dir = r > row ? 1 : -1;
		row = clamp(r, 0, rows.length - 1);
		cols[row] = clamp(c, 0, cellsOf(row).length - 1);
		settle(dir, viaKeyboard);
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

	deck.addEventListener(
		"wheel",
		(e) => {
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

	deck.addEventListener("pointerdown", (e) => {
		if (e.button !== 0 || isControl(e.target)) return;

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

		/* the world tracks the pointer 1:1, with resistance past the ends */
		if (axis === "x") {
			const max = cellsOf(row).length - 1;
			const over =
				(cols[row] === 0 && dx > 0) || (cols[row] === max && dx < 0) ? 0.35 : 1;
			gsap.set(rows[row], { x: baseX + dx * over });
		} else {
			const over = (row === 0 && dy > 0) || (row === rows.length - 1 && dy < 0) ? 0.35 : 1;
			gsap.set(world, { y: baseY + dy * over });
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

		if (past || flicked) {
			const back = travelled > 0;
			if (axis === "x") goCol(back ? -1 : 1);
			else goRow(back ? -1 : 1);
		} else {
			/* not far enough — spring back to where we were */
			settle(0);
		}

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
	paint();

	/*
	 * The intro tween starts the copy at zero opacity. In a background tab
	 * rAF is throttled, so that tween would not run and the copy would sit
	 * invisible until the tab was focused — skip it and keep the CSS default.
	 */
	if (document.visibilityState === "visible") arrive(1);
}
