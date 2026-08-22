/**
 * Horizontal streams for hub options 06 and 08.
 *
 * Two rules learned the hard way on option 05:
 *
 * 1. **No ambient motion.** Nothing moves until someone moves it. Every
 *    animation in here is the consequence of an action — a click, a key, a
 *    drag, a scroll the user started.
 * 2. **Never hijack the scroll.** The track is a real overflow container with
 *    real scroll snapping, so a trackpad, a shift-wheel, a touch swipe and the
 *    keyboard all work before a line of this file runs. What follows is
 *    enhancement on top of something that already works.
 */
import gsap from "gsap";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Track {
	root: HTMLElement;
	track: HTMLElement;
	items: HTMLElement[];
	counter: HTMLElement | null;
	prev: HTMLButtonElement | null;
	next: HTMLButtonElement | null;
	index: number;
}

/** Index of the item whose centre is nearest the centre of the viewport box. */
function nearest(t: Track): number {
	const mid = t.track.scrollLeft + t.track.clientWidth / 2;
	let best = 0;
	let bestDist = Infinity;
	t.items.forEach((item, i) => {
		const c = item.offsetLeft + item.offsetWidth / 2;
		const d = Math.abs(c - mid);
		if (d < bestDist) {
			bestDist = d;
			best = i;
		}
	});
	return best;
}

function goTo(t: Track, i: number): void {
	const item = t.items[Math.max(0, Math.min(t.items.length - 1, i))];
	if (!item) return;
	const left = item.offsetLeft - (t.track.clientWidth - item.offsetWidth) / 2;
	t.track.scrollTo({ left, behavior: reduced() ? "auto" : "smooth" });
}

function paint(t: Track): void {
	t.index = nearest(t);

	if (t.counter) {
		t.counter.textContent = `${String(t.index + 1).padStart(2, "0")} / ${String(
			t.items.length
		).padStart(2, "0")}`;
	}

	if (t.prev) t.prev.disabled = t.track.scrollLeft <= 2;
	if (t.next) {
		t.next.disabled = t.track.scrollLeft >= t.track.scrollWidth - t.track.clientWidth - 2;
	}

	t.items.forEach((item, i) => item.classList.toggle("is-current", i === t.index));
}

function wire(root: HTMLElement): Track | null {
	const track = root.querySelector<HTMLElement>("[data-track]");
	if (!track) return null;

	const t: Track = {
		root,
		track,
		items: Array.from(track.querySelectorAll<HTMLElement>("[data-item]")),
		counter: root.querySelector<HTMLElement>("[data-counter]"),
		prev: root.querySelector<HTMLButtonElement>("[data-prev]"),
		next: root.querySelector<HTMLButtonElement>("[data-next]"),
		index: 0,
	};

	if (!t.items.length) return null;

	t.prev?.addEventListener("click", () => goTo(t, t.index - 1));
	t.next?.addEventListener("click", () => goTo(t, t.index + 1));

	/* the track is a real scroll container, so this is just bookkeeping */
	let frame = 0;
	track.addEventListener(
		"scroll",
		() => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => paint(t));
		},
		{ passive: true }
	);

	track.addEventListener("keydown", (e) => {
		if (e.key === "ArrowRight") {
			e.preventDefault();
			goTo(t, t.index + 1);
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			goTo(t, t.index - 1);
		}
	});

	/* drag to pan, for mice with no horizontal wheel */
	let down = false;
	let startX = 0;
	let startScroll = 0;
	let moved = 0;

	track.addEventListener("pointerdown", (e) => {
		if (e.pointerType === "touch") return;
		down = true;
		moved = 0;
		startX = e.clientX;
		startScroll = track.scrollLeft;
		track.classList.add("is-dragging");
	});

	track.addEventListener("pointermove", (e) => {
		if (!down) return;
		const dx = e.clientX - startX;
		moved = Math.max(moved, Math.abs(dx));
		track.scrollLeft = startScroll - dx;
	});

	const release = () => {
		down = false;
		track.classList.remove("is-dragging");
	};

	track.addEventListener("pointerup", release);
	track.addEventListener("pointercancel", release);
	track.addEventListener("pointerleave", release);

	/* a drag that lands on a link must not follow it */
	t.items.forEach((item) => {
		item.addEventListener("click", (e) => {
			if (moved > 6) e.preventDefault();
		});
	});

	paint(t);
	return t;
}

/** Option 06 — every section is its own stream. */
export function initStreams(): void {
	document.querySelectorAll<HTMLElement>("[data-stream]").forEach(wire);
}

/**
 * Option 08 — same stream, but the item under the frame's centre line is
 * promoted: it grows, its detail unfolds, and its neighbours stand down.
 * Promotion is driven by scroll position, so it is still never ambient.
 */
export function initFocusStreams(): void {
	document.querySelectorAll<HTMLElement>("[data-focus-stream]").forEach((root) => {
		const t = wire(root);
		if (!t) return;

		const detail = root.querySelector<HTMLElement>("[data-detail]");
		if (!detail) return;

		let shown = -1;

		const show = () => {
			/* recomputed here rather than read off t.index, which the scroll
			   handler only refreshes on the next animation frame */
			const i = nearest(t);
			if (i === shown) return;
			shown = i;

			const item = t.items[i];
			const title = detail.querySelector<HTMLElement>("[data-detail-title]");
			const body = detail.querySelector<HTMLElement>("[data-detail-body]");
			const meta = detail.querySelector<HTMLElement>("[data-detail-meta]");

			if (title) title.textContent = item.dataset.title ?? "";
			if (body) body.textContent = item.dataset.blurb ?? "";
			if (meta) meta.textContent = item.dataset.meta ?? "";

			detail.dataset.accent = item.dataset.accent ?? "";

			if (reduced()) return;
			gsap.fromTo(
				detail.querySelectorAll<HTMLElement>("[data-detail-line]"),
				{ opacity: 0, y: 10 },
				{ opacity: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.06, overwrite: true }
			);
		};

		t.track.addEventListener("scroll", show, { passive: true });
		root.querySelectorAll("[data-prev], [data-next]").forEach((b) =>
			b.addEventListener("click", () => setTimeout(show, 320))
		);

		show();
	});
}
