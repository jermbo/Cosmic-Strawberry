import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText);

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Strokes draw themselves; labels, ticks and solids fade in behind them. */
export function drawFigure(fig: Element, delay = 0): gsap.core.Timeline {
	const tl = gsap.timeline({ delay });
	const strokes = fig.querySelectorAll<SVGElement>(".ln");
	const marks = fig.querySelectorAll<SVGElement>(".txt, [class*='fill-']");

	tl.set(fig, { opacity: 1 });

	if (strokes.length) {
		tl.fromTo(
			strokes,
			{ drawSVG: "0% 0%" },
			{
				drawSVG: "0% 100%",
				duration: 0.85,
				ease: "power2.inOut",
				stagger: { each: 0.035, from: "start" },
			},
			0
		);
	}

	if (marks.length) {
		tl.fromTo(
			marks,
			{ opacity: 0 },
			{ opacity: 1, duration: 0.4, ease: "none", stagger: 0.02 },
			0.3
		);
	}

	return tl;
}

/** Three flat bars land one after another, left to right (or top to bottom). */
export function assembleStripe(stripe: Element, delay = 0): gsap.core.Tween {
	const bars = stripe.querySelectorAll<HTMLElement>("span");
	const axis = stripe.classList.contains("stripe--v") ? "scaleY" : "scaleX";
	return gsap.fromTo(
		bars,
		{ [axis]: 0 },
		{
			[axis]: 1,
			duration: 0.62,
			ease: "power4.out",
			stagger: 0.085,
			delay,
			onStart: () => stripe.classList.add("is-set"),
		}
	);
}

/**
 * Run now if the element is already past the reading line (reload mid-page),
 * otherwise wait for the scroll to reach it. Nothing is allowed to stay
 * invisible because its trigger was behind us at load.
 */
function whenVisible(el: Element, ratio: number, run: () => void): void {
	if (el.getBoundingClientRect().top < window.innerHeight * ratio) {
		run();
		return;
	}
	ScrollTrigger.create({
		trigger: el,
		start: `top ${ratio * 100}%`,
		once: true,
		onEnter: run,
	});
}

/** Wrap each split line so the mask clips the incoming line. */
function maskLines(el: Element): SplitText {
	return new SplitText(el, {
		type: "lines",
		linesClass: "cs-line",
		mask: "lines",
	});
}

export function playHero(): void {
	const hero = document.querySelector(".hero");
	if (!hero) return;

	if (reduced()) {
		hero.querySelectorAll<HTMLElement>("[data-reveal], [data-fig]").forEach((n) => {
			n.style.opacity = "1";
		});
		hero.querySelectorAll(".stripe").forEach((s) => s.classList.add("is-set"));
		return;
	}

	const words = hero.querySelectorAll<HTMLElement>(".hero__word .display");
	const stripe = hero.querySelector(".hero__stripe");
	const fig = hero.querySelector("[data-fig]");
	const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

	hero.querySelectorAll<HTMLElement>(".hero__meta [data-reveal]").forEach((n, i) => {
		tl.fromTo(n, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5 }, 0.05 + i * 0.06);
	});

	words.forEach((w, i) => {
		const split = maskLines(w);
		gsap.set(w, { opacity: 1 });
		tl.from(
			split.lines,
			{ yPercent: 112, duration: 1.05, ease: "expo.out", stagger: 0.085 },
			0.18 + i * 0.09
		);
	});

	const rule = hero.querySelector<HTMLElement>(".rule");
	if (rule) {
		tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.95, ease: "expo.out" }, 0.12);
	}

	if (stripe) tl.add(assembleStripe(stripe), 0.52);

	hero
		.querySelectorAll<HTMLElement>(".hero__thesis [data-reveal], .hero__specs [data-reveal]")
		.forEach((n, i) => {
			tl.fromTo(n, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 0.7 + i * 0.07);
		});

	if (fig) tl.add(drawFigure(fig), 0.42);
}

export function initReveals(): void {
	if (reduced()) {
		document.querySelectorAll(".stripe").forEach((s) => s.classList.add("is-set"));
		document.querySelectorAll(".rule").forEach((r) => r.classList.add("is-set"));
		return;
	}

	/* schematic line-work outside the hero */
	document.querySelectorAll<HTMLElement>("[data-fig]").forEach((fig) => {
		if (fig.closest(".hero")) return;
		whenVisible(fig, 0.88, () => drawFigure(fig));
	});

	/* stripes assemble */
	document.querySelectorAll<HTMLElement>(".stripe").forEach((stripe) => {
		if (stripe.closest(".hero") || stripe.closest(".nav") || stripe.closest(".wipe")) return;
		whenVisible(stripe, 0.92, () => assembleStripe(stripe));
	});

	/* hairline rules draw across */
	document.querySelectorAll<HTMLElement>(".rule").forEach((rule) => {
		if (rule.closest(".hero")) return;
		whenVisible(rule, 0.94, () =>
			gsap.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "expo.out" })
		);
	});

	/* copy blocks */
	document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
		if (el.closest(".hero")) return;
		const mode = el.getAttribute("data-reveal");
		whenVisible(el, 0.9, () => {
			if (mode === "lines") {
				const split = maskLines(el);
				gsap.set(el, { opacity: 1 });
				gsap.from(split.lines, {
					yPercent: 110,
					duration: 0.95,
					ease: "expo.out",
					stagger: 0.055,
				});
			} else {
				gsap.fromTo(
					el,
					{ opacity: 0, y: 16 },
					{ opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
				);
			}
		});
	});

	/* grouped children (cards, steps) get a stagger of their own */
	document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((group) => {
		const kids = Array.from(group.children) as HTMLElement[];
		gsap.set(kids, { opacity: 0, y: 22 });
		whenVisible(group, 0.82, () =>
			gsap.to(kids, {
				opacity: 1,
				y: 0,
				duration: 0.85,
				ease: "power3.out",
				stagger: 0.09,
			})
		);
	});

	ScrollTrigger.refresh();
}

export function initProgress(): void {
	const bar = document.querySelector<HTMLElement>(".progress");
	if (!bar) return;
	gsap.to(bar, {
		scaleX: 1,
		ease: "none",
		scrollTrigger: { start: 0, end: "max", scrub: 0.25 },
	});
}

/**
 * Pinned-panel wiring: the diagram sits sticky while prose scrolls past, and
 * each prose chunk lights its matching callout on the diagram.
 */
export function initPinned(): void {
	const panel = document.querySelector<HTMLElement>(".pinned");
	if (!panel) return;

	const chunks = panel.querySelectorAll<HTMLElement>("[data-step]");
	const callouts = panel.querySelectorAll<HTMLElement>(".callout");
	const readout = panel.querySelector<HTMLElement>("[data-readout]");

	const setStep = (step: string) => {
		callouts.forEach((c) => c.classList.toggle("is-active", c.dataset.callout === step));
		if (readout) {
			const active = Array.from(chunks).find((c) => c.dataset.step === step);
			readout.textContent = active?.dataset.readout ?? "";
		}
	};

	chunks.forEach((chunk) => {
		const step = chunk.dataset.step ?? "";
		ScrollTrigger.create({
			trigger: chunk,
			start: "top 62%",
			end: "bottom 62%",
			onEnter: () => setStep(step),
			onEnterBack: () => setStep(step),
		});
	});

	if (chunks[0]) setStep(chunks[0].dataset.step ?? "");
}

/**
 * The no-motion path. Pages that opt out of animation still have to look
 * finished: stripes and rules default to scale 0, and reveal targets default
 * to opacity 0, both waiting on GSAP that is never going to run.
 */
export function settle(root: ParentNode = document): void {
	root.querySelectorAll(".stripe").forEach((s) => s.classList.add("is-set"));
	root.querySelectorAll(".rule").forEach((r) => r.classList.add("is-set"));
	root.querySelectorAll<HTMLElement>("[data-reveal], [data-fig]").forEach((n) => {
		n.style.opacity = "1";
	});
}
