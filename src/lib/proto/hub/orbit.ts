/**
 * OPTION 5 — THE ORBITAL FIELD
 *
 * The Z-axis the flat options were missing. Projects travel elliptical orbits
 * around a core; each one passes *behind* the wordmark on the far half of its
 * path and *in front* of it on the near half. Depth is carried by scale,
 * stroke weight and stacking order — never by glow or blur, which the design
 * system does not allow.
 *
 * Two references, split by job: the motion grammar (orbit, depth, crossing)
 * comes from the Tech Valley shot, the texture (hairline, monochrome, type
 * living inside the illustration) from the Marcato one.
 *
 * No new dependencies — GSAP and CSS transforms, both already here.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const num = (el: HTMLElement, key: string, fallback: number) =>
	Number(el.dataset[key] ?? fallback);

interface Orbiter {
	el: HTMLElement;
	/** Ellipse radii in stage units, before tilt. */
	rx: number;
	ry: number;
	/** Ellipse rotation, radians. */
	tilt: number;
	/** Where on the path it starts. */
	phase: number;
	/** Radians per second. */
	speed: number;
	/** 0 far, 1 near — parallax weight only; the orbit itself carries the rest. */
	depth: number;
}

export function initOrbitField(): void {
	const field = document.querySelector<HTMLElement>("[data-field]");
	const stage = document.querySelector<HTMLElement>("[data-stage]");
	if (!field || !stage) return;

	const readout = field.querySelector<HTMLElement>("[data-readout]");
	const defaultReadout = readout?.textContent ?? "";

	const orbiters: Orbiter[] = Array.from(
		stage.querySelectorAll<HTMLElement>("[data-orbiter]")
	).map((el) => ({
		el,
		rx: num(el, "rx", 300),
		ry: num(el, "ry", 110),
		tilt: (num(el, "tilt", 0) * Math.PI) / 180,
		phase: (num(el, "phase", 0) * Math.PI) / 180,
		speed: (Math.PI * 2) / num(el, "period", 40),
		depth: num(el, "depth", 0.5),
	}));

	if (!orbiters.length) return;

	/* ---------- placing one orbiter at a point on its path ---------- */

	/**
	 * Orbits are authored against a 1200px stage. Rather than scale every
	 * coordinate in JS, the whole system scales as one element, so the drawn
	 * paths and the things travelling them can never drift apart.
	 */
	const BASE_W = 1400;
	const system = stage.querySelector<HTMLElement>("[data-system]") ?? stage;

	const measure = () => {
		const unit = Math.min(1, stage.clientWidth / BASE_W);
		system.style.setProperty("--unit", String(unit));
	};

	measure();
	window.addEventListener("resize", measure);

	const place = (o: Orbiter, t: number, px: number, py: number) => {
		const a = o.phase + t * o.speed;

		/* untilted ellipse, then rotated into the system's plane */
		const lx = o.rx * Math.cos(a);
		const ly = o.ry * Math.sin(a);
		const x = lx * Math.cos(o.tilt) - ly * Math.sin(o.tilt);
		const y = lx * Math.sin(o.tilt) + ly * Math.cos(o.tilt);

		/* 0 at the far side of the path, 1 at the near side */
		const near = (Math.sin(a) + 1) / 2;

		/* parallax: near orbits answer the pointer more than far ones */
		const drift = 0.35 + o.depth * 0.85;

		o.el.style.transform = `translate3d(${x + px * drift}px, ${y + py * drift}px, 0) scale(${
			0.72 + near * 0.46
		})`;
		o.el.style.opacity = String(0.42 + near * 0.58);
		/* the crossing: in front of the wordmark on the near half, behind on the far */
		o.el.style.zIndex = near > 0.5 ? "20" : "4";
	};

	/* ---------- reduced motion: one honest still frame ---------- */

	if (reduced()) {
		orbiters.forEach((o) => place(o, 0, 0, 0));
		return;
	}

	/* ---------- pointer parallax ---------- */

	const pointer = { x: 0, y: 0 };
	const target = { x: 0, y: 0 };

	field.addEventListener("pointermove", (e) => {
		const r = field.getBoundingClientRect();
		target.x = ((e.clientX - r.left) / r.width - 0.5) * 40;
		target.y = ((e.clientY - r.top) / r.height - 0.5) * 28;
	});

	field.addEventListener("pointerleave", () => {
		target.x = 0;
		target.y = 0;
	});

	/* ---------- hover: hold the system still and name the thing ---------- */

	const rate = { value: 1 };

	orbiters.forEach((o) => {
		const focus = () => {
			field.classList.add("is-focused");
			o.el.classList.add("is-focused");
			gsap.to(rate, { value: 0.12, duration: 0.6, ease: "power2.out" });
			if (readout) readout.textContent = o.el.dataset.readout ?? defaultReadout;
		};

		const blur = () => {
			field.classList.remove("is-focused");
			o.el.classList.remove("is-focused");
			gsap.to(rate, { value: 1, duration: 0.9, ease: "power2.out" });
			if (readout) readout.textContent = defaultReadout;
		};

		o.el.addEventListener("pointerenter", focus);
		o.el.addEventListener("pointerleave", blur);
		o.el.addEventListener("focus", focus);
		o.el.addEventListener("blur", blur);
	});

	/* ---------- the clock ---------- */

	let t = 0;
	let running = true;

	const tick = (_time: number, delta: number) => {
		if (!running) return;
		t += (delta / 1000) * rate.value;
		pointer.x += (target.x - pointer.x) * 0.06;
		pointer.y += (target.y - pointer.y) * 0.06;
		orbiters.forEach((o) => place(o, t, pointer.x, pointer.y));
	};

	gsap.ticker.add(tick);

	/* nothing spins while it is off screen */
	const io = new IntersectionObserver(
		([entry]) => {
			running = entry.isIntersecting;
		},
		{ threshold: 0 }
	);
	io.observe(field);

	/* ---------- flying through: the field recedes as you leave it ---------- */

	gsap.to(stage, {
		scale: 1.22,
		opacity: 0,
		ease: "none",
		scrollTrigger: {
			trigger: field,
			start: "top top",
			end: "bottom top",
			scrub: 0.4,
		},
	});
}
