/**
 * Talk show — slides with optional in-slide steps.
 *
 * Advance: next step, then next slide. Back reverses.
 * Hash: `#3` / `#3.2`. Reduced motion → instant.
 */
import gsap from "gsap";
import { MOTIONS, type MotionAttr } from "./motions";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CLEAR = {
	autoAlpha: 1,
	x: 0,
	y: 0,
	scale: 1,
	scaleX: 1,
	scaleY: 1,
	rotation: 0,
	rotateX: 0,
	rotateY: 0,
	filter: "blur(0px)",
} as const;

const HIDDEN = { ...CLEAR, autoAlpha: 0 };

function stepsOf(slide: HTMLElement): HTMLElement[] {
	return Array.from(slide.querySelectorAll<HTMLElement>("[data-step]"));
}

function motionOf(el: HTMLElement) {
	const key = (el.dataset.motion ?? "fade") as MotionAttr;
	return MOTIONS[key] ?? MOTIONS.fade;
}

function pad(n: number): string {
	return String(n).padStart(2, "0");
}

function readHash(slideCount: number): { slide: number; revealed: number } | null {
	const raw = window.location.hash.replace(/^#/, "").trim();
	if (!raw) return null;
	const m = raw.match(/^(\d+)(?:\.(\d+))?$/);
	if (!m) return null;
	const slide = Number(m[1]) - 1;
	const revealed = m[2] !== undefined ? Number(m[2]) : 0;
	if (!Number.isFinite(slide) || slide < 0 || slide >= slideCount) return null;
	if (!Number.isFinite(revealed) || revealed < 0) return null;
	return { slide, revealed };
}

function writeHash(slideIndex: number, revealed: number): void {
	const slide = String(slideIndex + 1);
	const next = revealed > 0 ? `#${slide}.${revealed}` : `#${slide}`;
	if (window.location.hash === next) return;
	history.replaceState(null, "", `${window.location.pathname}${window.location.search}${next}`);
}

export function initTalkShow(): void {
	const root = document.querySelector<HTMLElement>("[data-talk]");
	if (!root) return;

	const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-slide]"));
	const counter = root.querySelector<HTMLElement>("[data-counter]");
	const progress = root.querySelector<HTMLElement>("[data-progress]");
	const status = root.querySelector<HTMLElement>("[data-status]");
	const prevBtn = root.querySelector<HTMLButtonElement>("[data-prev]");
	const nextBtn = root.querySelector<HTMLButtonElement>("[data-next]");
	if (!slides.length) return;

	let index = 0;
	let revealed = 0;
	let busy = false;
	let writingHash = false;

	const boot = readHash(slides.length);
	if (boot) {
		index = boot.slide;
		revealed = Math.min(boot.revealed, stepsOf(slides[index]).length);
	}

	function syncSteps(slide: HTMLElement, count: number, animate: boolean): void {
		const steps = stepsOf(slide);
		steps.forEach((el, i) => {
			const on = i < count;
			el.classList.toggle("is-revealed", on);
			el.setAttribute("aria-hidden", on ? "false" : "true");

			const isLatest = on && i === count - 1;
			if (!animate || reduced() || !isLatest) {
				gsap.set(el, on ? { ...CLEAR } : { ...HIDDEN });
				return;
			}

			busy = true;
			const { from, ease = "power3.out" } = motionOf(el);
			gsap.fromTo(el, from, {
				...CLEAR,
				duration: 0.48,
				ease,
				onComplete: () => {
					busy = false;
				},
			});
		});
	}

	function updateChrome(): void {
		const slide = slides[index];
		const steps = stepsOf(slide);
		const n = slides.length;

		if (counter) counter.textContent = `${pad(index + 1)} / ${pad(n)}`;

		const stepFrac = steps.length ? revealed / steps.length : 1;
		if (progress) progress.style.setProperty("--p", String(Math.min(1, (index + stepFrac) / n)));

		if (status) {
			if (steps.length && revealed < steps.length) {
				status.textContent = `Slide ${index + 1} of ${n}, reveal ${revealed} of ${steps.length}`;
			} else {
				status.textContent = `Slide ${index + 1} of ${n}`;
			}
		}

		if (prevBtn) prevBtn.disabled = index === 0 && revealed === 0;
		if (nextBtn) nextBtn.disabled = index === n - 1 && revealed >= steps.length;

		root.dataset.accent = slide.dataset.accent ?? "purple";
		root.dataset.kind = slide.dataset.kind ?? "";

		writingHash = true;
		writeHash(index, revealed);
		queueMicrotask(() => {
			writingHash = false;
		});
	}

	function paintSlide(from?: number): void {
		slides.forEach((s, i) => {
			const on = i === index;
			s.classList.toggle("is-current", on);
			s.setAttribute("aria-hidden", on ? "false" : "true");
			s.inert = !on;
		});

		updateChrome();

		const animateSlide = from !== undefined && from !== index && !reduced();
		if (animateSlide) {
			const dir = index > from! ? 1 : -1;
			busy = true;
			gsap.fromTo(
				slides[index],
				{ autoAlpha: 0, x: dir * 28 },
				{
					autoAlpha: 1,
					x: 0,
					duration: 0.42,
					ease: "power3.out",
					onComplete: () => {
						busy = false;
					},
				},
			);
			gsap.set(slides[from!], { autoAlpha: 0, x: 0 });
		} else {
			slides.forEach((s, i) => {
				gsap.set(s, { autoAlpha: i === index ? 1 : 0, x: 0 });
			});
		}

		syncSteps(slides[index], revealed, false);
	}

	function goSlide(to: number, showAllSteps: boolean): void {
		const next = Math.max(0, Math.min(slides.length - 1, to));
		if (busy) return;
		const from = index;
		index = next;
		revealed = showAllSteps ? stepsOf(slides[index]).length : 0;
		if (from === next) paintSlide();
		else paintSlide(from);
	}

	function applyHash(): void {
		const pos = readHash(slides.length);
		if (!pos) return;
		const nextRevealed = Math.min(pos.revealed, stepsOf(slides[pos.slide]).length);
		if (pos.slide === index && nextRevealed === revealed) return;

		const from = index;
		index = pos.slide;
		revealed = nextRevealed;

		if (from !== index) {
			paintSlide();
			return;
		}
		syncSteps(slides[index], revealed, false);
		updateChrome();
	}

	function forward(): void {
		if (busy) return;
		const steps = stepsOf(slides[index]);
		if (revealed < steps.length) {
			revealed += 1;
			syncSteps(slides[index], revealed, true);
			updateChrome();
			return;
		}
		if (index < slides.length - 1) goSlide(index + 1, false);
	}

	function back(): void {
		if (busy) return;
		if (revealed > 0) {
			revealed -= 1;
			syncSteps(slides[index], revealed, false);
			updateChrome();
			return;
		}
		if (index > 0) goSlide(index - 1, true);
	}

	prevBtn?.addEventListener("click", back);
	nextBtn?.addEventListener("click", forward);

	window.addEventListener("keydown", (e) => {
		const t = e.target as HTMLElement | null;
		if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
		if (e.metaKey || e.ctrlKey || e.altKey) return;

		const go: Record<string, () => void> = {
			ArrowRight: forward,
			ArrowDown: forward,
			PageDown: forward,
			" ": forward,
			ArrowLeft: back,
			ArrowUp: back,
			PageUp: back,
			Backspace: back,
			Home: () => goSlide(0, false),
			End: () => goSlide(slides.length - 1, true),
		};
		const fn = go[e.key];
		if (!fn) return;
		e.preventDefault();
		fn();
	});

	root.addEventListener("click", (e) => {
		const target = e.target as HTMLElement;
		if (target.closest("a, button, [data-no-advance]")) return;
		const rect = root.getBoundingClientRect();
		const x = e.clientX - rect.left;
		if (x > rect.width * 0.66) forward();
		else if (x < rect.width * 0.33) back();
	});

	let touchX = 0;
	root.addEventListener(
		"touchstart",
		(e) => {
			touchX = e.changedTouches[0]?.clientX ?? 0;
		},
		{ passive: true },
	);
	root.addEventListener(
		"touchend",
		(e) => {
			const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX;
			if (Math.abs(dx) < 48) return;
			if (dx < 0) forward();
			else back();
		},
		{ passive: true },
	);

	window.addEventListener("hashchange", () => {
		if (!writingHash) applyHash();
	});

	paintSlide();
	root.focus({ preventScroll: true });
}
