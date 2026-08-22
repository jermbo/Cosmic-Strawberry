/**
 * OPTION 4 — the spatial map.
 *
 * The one Phase 1 option that gets motion, because a constellation that does
 * not move is just a scatter plot: the drift, the drawn links and the pull on
 * hover are the argument, not decoration on top of it.
 *
 * Pan by dragging, zoom with the wheel or the +/- controls. Everything here
 * is progressive — the plain list under the map is the real fallback, and
 * reduced motion drops straight to the settled state.
 */
import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin);

const MIN_SCALE = 0.55;
const MAX_SCALE = 2.2;
const DRAG_SLOP = 5;

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function initConstellation(): void {
	const map = document.querySelector<HTMLElement>("[data-map]");
	if (!map) return;

	const world = map.querySelector<HTMLElement>("[data-world]");
	const nodes = Array.from(map.querySelectorAll<HTMLElement>("[data-node]"));
	const links = Array.from(map.querySelectorAll<SVGPathElement>("[data-link]"));
	const readout = map.querySelector<HTMLElement>("[data-readout]");
	if (!world) return;

	/* ---------- view transform ---------- */

	const view = { x: 0, y: 0, scale: 1 };
	const apply = () => gsap.set(world, { x: view.x, y: view.y, scale: view.scale });

	const zoomAt = (factor: number, cx: number, cy: number) => {
		const next = clamp(view.scale * factor, MIN_SCALE, MAX_SCALE);
		if (next === view.scale) return;
		/* keep the point under the cursor fixed while the scale changes */
		const rect = map.getBoundingClientRect();
		const px = cx - rect.left - rect.width / 2;
		const py = cy - rect.top - rect.height / 2;
		const ratio = next / view.scale;
		view.x = px - (px - view.x) * ratio;
		view.y = py - (py - view.y) * ratio;
		view.scale = next;
		apply();
	};

	map.addEventListener(
		"wheel",
		(e) => {
			e.preventDefault();
			zoomAt(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX, e.clientY);
		},
		{ passive: false }
	);

	/* ---------- drag to pan ---------- */

	let dragging = false;
	let moved = 0;
	let startX = 0;
	let startY = 0;
	let originX = 0;
	let originY = 0;

	map.addEventListener("pointerdown", (e) => {
		dragging = true;
		moved = 0;
		startX = e.clientX;
		startY = e.clientY;
		originX = view.x;
		originY = view.y;
		map.setPointerCapture(e.pointerId);
		map.classList.add("is-dragging");
	});

	map.addEventListener("pointermove", (e) => {
		if (!dragging) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
		view.x = originX + dx;
		view.y = originY + dy;
		apply();
	});

	const endDrag = (e: PointerEvent) => {
		if (!dragging) return;
		dragging = false;
		map.classList.remove("is-dragging");
		if (map.hasPointerCapture(e.pointerId)) map.releasePointerCapture(e.pointerId);
	};

	map.addEventListener("pointerup", endDrag);
	map.addEventListener("pointercancel", endDrag);

	/* a drag that ends on a node must not count as a click through to it */
	nodes.forEach((node) => {
		node.addEventListener("click", (e) => {
			if (moved > DRAG_SLOP) e.preventDefault();
		});
	});

	/* ---------- controls ---------- */

	map.querySelectorAll<HTMLButtonElement>("[data-zoom]").forEach((btn) => {
		btn.addEventListener("click", () => {
			const rect = map.getBoundingClientRect();
			const dir = btn.dataset.zoom === "in" ? 1.25 : 1 / 1.25;
			zoomAt(dir, rect.left + rect.width / 2, rect.top + rect.height / 2);
		});
	});

	map.querySelector<HTMLButtonElement>("[data-reset]")?.addEventListener("click", () => {
		gsap.to(view, {
			x: 0,
			y: 0,
			scale: 1,
			duration: reduced() ? 0 : 0.7,
			ease: "power3.out",
			onUpdate: apply,
		});
	});

	/* ---------- relation highlighting ---------- */

	const setActive = (idx: string | null) => {
		map.classList.toggle("is-focused", idx !== null);

		nodes.forEach((n) => {
			const related =
				idx !== null &&
				(n.dataset.node === idx || (n.dataset.links ?? "").split(",").includes(idx));
			n.classList.toggle("is-related", related);
		});

		links.forEach((l) => {
			const on = idx !== null && (l.dataset.from === idx || l.dataset.to === idx);
			l.classList.toggle("is-lit", on);
		});

		if (readout) {
			const node = idx ? nodes.find((n) => n.dataset.node === idx) : null;
			readout.textContent = node?.dataset.readout ?? "DRAG TO PAN / SCROLL TO ZOOM";
		}
	};

	nodes.forEach((node) => {
		const idx = node.dataset.node ?? null;
		node.addEventListener("pointerenter", () => setActive(idx));
		node.addEventListener("focus", () => setActive(idx));
		node.addEventListener("pointerleave", () => setActive(null));
		node.addEventListener("blur", () => setActive(null));
	});

	/* ---------- intro + drift ---------- */

	if (reduced()) {
		gsap.set(nodes, { opacity: 1, scale: 1 });
		gsap.set(links, { opacity: 1 });
		return;
	}

	const tl = gsap.timeline();

	tl.fromTo(
		links,
		{ drawSVG: "50% 50%", opacity: 1 },
		{ drawSVG: "0% 100%", duration: 1.1, ease: "power2.inOut", stagger: 0.12 },
		0.15
	);

	tl.fromTo(
		nodes,
		{ opacity: 0, scale: 0.7 },
		{ opacity: 1, scale: 1, duration: 0.7, ease: "back.out(2)", stagger: 0.09 },
		0.05
	);

	/* each node breathes on its own clock, so the field never pulses in unison */
	nodes.forEach((node, i) => {
		gsap.to(node, {
			xPercent: gsap.utils.random(-2.5, 2.5),
			yPercent: gsap.utils.random(-3, 3),
			duration: gsap.utils.random(4.5, 7.5),
			ease: "sine.inOut",
			repeat: -1,
			yoyo: true,
			delay: 1 + i * 0.2,
		});
	});
}
