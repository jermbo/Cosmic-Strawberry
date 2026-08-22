import gsap from "gsap";

/**
 * Two-state instrument cursor: a trailing ring that snaps from circle to
 * crosshair-square over anything interactive, plus a mono tag read from
 * `data-cursor` on the target.
 */
export function initCursor(): void {
	if (window.matchMedia("(pointer: coarse)").matches) return;

	// Not `.cursor` — the kit page renders static copies of this markup to
	// document the two states, and they appear earlier in the document.
	const el = document.querySelector<HTMLElement>("[data-cursor-root]");
	if (!el) return;

	const tag = el.querySelector<HTMLElement>(".cursor__tag");
	document.documentElement.classList.add("has-cursor");

	gsap.set(el, { xPercent: 0, yPercent: 0, x: -100, y: -100 });

	const x = gsap.quickTo(el, "x", { duration: 0.22, ease: "power3.out" });
	const y = gsap.quickTo(el, "y", { duration: 0.22, ease: "power3.out" });

	window.addEventListener(
		"pointermove",
		(e) => {
			x(e.clientX);
			y(e.clientY);
		},
		{ passive: true }
	);

	window.addEventListener("pointerdown", () => el.classList.add("is-down"));
	window.addEventListener("pointerup", () => el.classList.remove("is-down"));
	document.addEventListener("pointerleave", () => gsap.to(el, { opacity: 0, duration: 0.2 }));
	document.addEventListener("pointerenter", () => gsap.to(el, { opacity: 1, duration: 0.2 }));

	const SELECTOR = "a, button, [data-cursor]";

	document.addEventListener(
		"pointerover",
		(e) => {
			const hit = (e.target as Element | null)?.closest?.(SELECTOR);
			if (!hit) return;
			el.classList.add("is-hover");
			if (tag) tag.textContent = hit.getAttribute("data-cursor") ?? "";
		},
		{ passive: true }
	);

	document.addEventListener(
		"pointerout",
		(e) => {
			const hit = (e.target as Element | null)?.closest?.(SELECTOR);
			if (!hit) return;
			const next = (e as PointerEvent).relatedTarget as Element | null;
			if (next?.closest?.(SELECTOR)) return;
			el.classList.remove("is-hover");
			if (tag) tag.textContent = "";
		},
		{ passive: true }
	);
}
