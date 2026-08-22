/**
 * The playful layer for hub option 06.
 *
 * Everything here is reactive: it answers the pointer, and it rests when the
 * pointer rests. Nothing plays on a timer, which keeps it on the right side
 * of the ambient/transitional line the orbital option fell foul of.
 *
 * Three moves:
 *   parallax  — layers in the active cell answer the pointer at different rates
 *   magnet    — the launch zone leans toward a nearby cursor
 *   lean      — set by the deck while dragging; consumed in CSS
 *
 * Targets are chosen so they never collide with the elements the deck itself
 * tweens: the deck owns [data-ghost], [data-panel] and [data-line], and this
 * file owns [data-par] and [data-magnet].
 */
import gsap from "gsap";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** How far the pointer can pull a magnetic element, in px. */
const MAGNET_PULL = 14;
/** Radius within which a magnet notices the pointer, in px. */
const MAGNET_RANGE = 130;

export function initPlay(): void {
	if (reduced()) return;

	const deck = document.querySelector<HTMLElement>("[data-deck]");
	if (!deck) return;

	/* ------------------------------------------------------------- parallax */

	const layers = Array.from(deck.querySelectorAll<HTMLElement>("[data-par]"));

	/* quickTo keeps one interpolator per property rather than spawning a
	   tween on every pointer event */
	const movers = layers.map((el) => ({
		el,
		depth: Number(el.dataset.par ?? 0.04),
		x: gsap.quickTo(el, "x", { duration: 0.7, ease: "power3" }),
		y: gsap.quickTo(el, "y", { duration: 0.7, ease: "power3" }),
	}));

	/*
	 * Only the cell in view answers the pointer. The live sets are recomputed
	 * when the world moves rather than on every pointer event — otherwise
	 * each mouse move costs a `closest()` per layer and a layout read per
	 * magnet, which is exactly the jank this layer is supposed to avoid.
	 */
	let liveMovers = movers;

	function parallax(nx: number, ny: number): void {
		liveMovers.forEach((m) => {
			m.x(nx * m.depth * 100);
			m.y(ny * m.depth * 60);
		});
	}

	/* --------------------------------------------------------------- magnet */

	const magnets = Array.from(deck.querySelectorAll<HTMLElement>("[data-magnet]")).map((el) => ({
		el,
		x: gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" }),
		y: gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" }),
	}));

	let liveMagnets = magnets;

	function magnetise(px: number, py: number): void {
		liveMagnets.forEach((m) => {
			const r = m.el.getBoundingClientRect();
			if (!r.width) return;

			const cx = r.left + r.width / 2;
			const cy = r.top + r.height / 2;
			const dx = px - cx;
			const dy = py - cy;
			const dist = Math.hypot(dx, dy);

			if (dist > MAGNET_RANGE) {
				m.el.classList.remove("is-near");
				m.x(0);
				m.y(0);
				return;
			}

			/* full pull at the centre, none at the edge of the range */
			const force = 1 - dist / MAGNET_RANGE;
			m.el.classList.add("is-near");
			m.x((dx / MAGNET_RANGE) * MAGNET_PULL * force * 2);
			m.y((dy / MAGNET_RANGE) * MAGNET_PULL * force * 2);
		});
	}

	/* ---------------------------------------------------------------- wiring */

	function refresh(): void {
		const active = deck.querySelector<HTMLElement>(".cell.is-active");

		/* park whatever is leaving before narrowing the set */
		liveMovers.forEach((m) => {
			m.x(0);
			m.y(0);
		});
		liveMagnets.forEach((m) => {
			m.el.classList.remove("is-near");
			m.x(0);
			m.y(0);
		});

		liveMovers = active ? movers.filter((m) => active.contains(m.el)) : [];
		liveMagnets = active ? magnets.filter((m) => active.contains(m.el)) : [];
	}

	deck.addEventListener("deck:move", refresh);
	refresh();

	deck.addEventListener("pointermove", (e) => {
		const r = deck.getBoundingClientRect();
		parallax((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5);
		magnetise(e.clientX, e.clientY);
	});

	deck.addEventListener("pointerleave", () => {
		parallax(0, 0);
		magnetise(-9999, -9999);
	});

}
