/**
 * Vitrine — hub option 07 (close translation of the Flor Keeps reference).
 *
 * One hairline frame filling the viewport, and it never moves. Sections are
 * switched from the frame's own top band; specimens are traversed left and
 * right inside the stage. Nothing scrolls, so the chrome is genuinely
 * constant rather than merely repeated.
 *
 * No autoplay. A carousel that advances on its own is ambient motion wearing
 * a different hat.
 */
import gsap from "gsap";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export function initVitrine(): void {
	const root = document.querySelector<HTMLElement>("[data-vitrine]");
	if (!root) return;

	/* the stage holds one group of slides per case; the left cell holds the
	   matching group of index entries. They live in different frame cells, so
	   they are paired by position rather than by nesting. */
	const cases = Array.from(root.querySelectorAll<HTMLElement>("[data-case]"));
	const groups = Array.from(root.querySelectorAll<HTMLElement>("[data-index-group]"));
	const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-tab]"));
	const counter = root.querySelector<HTMLElement>("[data-counter]");
	const peek = root.querySelector<HTMLElement>("[data-peek]");
	const note = root.querySelector<HTMLElement>("[data-note]");
	if (!cases.length) return;

	let caseIndex = 0;
	const slideIndex = cases.map(() => 0);
	let busy = false;

	const slidesOf = (c: number) =>
		Array.from(cases[c].querySelectorAll<HTMLElement>("[data-slide]"));

	const entriesOf = (c: number) =>
		groups[c] ? Array.from(groups[c].querySelectorAll<HTMLButtonElement>("[data-entry]")) : [];

	function paint(): void {
		const slides = slidesOf(caseIndex);
		const i = slideIndex[caseIndex];

		cases.forEach((c, n) => {
			const on = n === caseIndex;
			c.classList.toggle("is-current", on);
			c.setAttribute("aria-hidden", on ? "false" : "true");
			groups[n]?.classList.toggle("is-current", on);

			slidesOf(n).forEach((s, m) => {
				const showing = on && m === i;
				s.classList.toggle("is-current", showing);
				s.setAttribute("aria-hidden", showing ? "false" : "true");
				s.querySelectorAll<HTMLElement>("a, button").forEach((f) => {
					if (showing) f.removeAttribute("tabindex");
					else f.setAttribute("tabindex", "-1");
				});
			});

			entriesOf(n).forEach((e, m) => {
				e.classList.toggle("is-current", on && m === i);
				e.setAttribute("aria-current", on && m === i ? "true" : "false");
			});
		});

		tabs.forEach((t, n) => {
			t.classList.toggle("is-current", n === caseIndex);
			t.setAttribute("aria-current", n === caseIndex ? "true" : "false");
		});

		if (counter) {
			counter.textContent = `${String(i + 1).padStart(2, "0")} / ${String(
				slides.length
			).padStart(2, "0")}`;
		}

		if (peek) {
			peek.textContent = slides[(i + 1) % slides.length]?.dataset.title ?? "";
		}

		if (note) note.textContent = cases[caseIndex].dataset.note ?? "";

		root.dataset.accent = slides[i]?.dataset.accent ?? "";
	}

	function animate(dir: number): void {
		if (reduced()) return;
		const slide = slidesOf(caseIndex)[slideIndex[caseIndex]];
		if (!slide) return;

		busy = true;
		gsap.fromTo(
			slide,
			{ opacity: 0, xPercent: 6 * dir },
			{
				opacity: 1,
				xPercent: 0,
				duration: 0.6,
				ease: "power3.out",
				overwrite: true,
				onComplete: () => (busy = false),
			}
		);

		gsap.fromTo(
			slide.querySelectorAll<HTMLElement>("[data-line]"),
			{ opacity: 0, y: 14 },
			{
				opacity: 1,
				y: 0,
				duration: 0.5,
				ease: "power3.out",
				stagger: 0.05,
				delay: 0.1,
				overwrite: true,
			}
		);
	}

	function goSlide(delta: number): void {
		if (busy) return;
		const slides = slidesOf(caseIndex);
		const next = (slideIndex[caseIndex] + delta + slides.length) % slides.length;
		if (next === slideIndex[caseIndex]) return;
		slideIndex[caseIndex] = next;
		paint();
		animate(delta > 0 ? 1 : -1);
	}

	function setSlide(i: number): void {
		if (busy) return;
		const slides = slidesOf(caseIndex);
		const next = clamp(i, 0, slides.length - 1);
		const dir = next > slideIndex[caseIndex] ? 1 : -1;
		if (next === slideIndex[caseIndex]) return;
		slideIndex[caseIndex] = next;
		paint();
		animate(dir);
	}

	function setCase(i: number): void {
		if (busy || i === caseIndex) return;
		const dir = i > caseIndex ? 1 : -1;
		caseIndex = clamp(i, 0, cases.length - 1);
		paint();
		animate(dir);
	}

	root.querySelector("[data-prev]")?.addEventListener("click", () => goSlide(-1));
	root.querySelector("[data-next]")?.addEventListener("click", () => goSlide(1));

	tabs.forEach((tab, n) => tab.addEventListener("click", () => setCase(n)));

	cases.forEach((c, n) => {
		entriesOf(n).forEach((entry, m) => {
			entry.addEventListener("click", () => {
				if (n !== caseIndex) setCase(n);
				setSlide(m);
			});
		});
	});

	root.addEventListener("keydown", (e) => {
		const map: Record<string, () => void> = {
			ArrowRight: () => goSlide(1),
			ArrowLeft: () => goSlide(-1),
			ArrowDown: () => setCase(caseIndex + 1),
			ArrowUp: () => setCase(caseIndex - 1),
		};
		const fn = map[e.key];
		if (!fn) return;
		e.preventDefault();
		fn();
	});

	/* drag across the stage moves between specimens */
	const stage = root.querySelector<HTMLElement>("[data-stage]");
	if (stage) {
		let down = false;
		let startX = 0;

		stage.addEventListener("pointerdown", (e) => {
			down = true;
			startX = e.clientX;
		});

		stage.addEventListener("pointerup", (e) => {
			if (!down) return;
			down = false;
			const dx = e.clientX - startX;
			if (Math.abs(dx) > 60) goSlide(dx < 0 ? 1 : -1);
		});

		stage.addEventListener("pointerleave", () => (down = false));
	}

	root.setAttribute("tabindex", "0");
	paint();
}
