import gsap from "gsap";

const KEY = "cs-proto-theme";

/**
 * Light/dark switch. The transition itself is the moment: the three accent
 * bands sweep across the viewport left→right, the palette swaps under cover,
 * and the bands retract off the right edge.
 */
export function initTheme(): void {
	const btn = document.querySelector<HTMLButtonElement>(".toggle");
	const wipe = document.querySelector<HTMLElement>(".wipe");
	if (!btn) return;

	const bands = wipe ? Array.from(wipe.querySelectorAll<HTMLElement>("i")) : [];
	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	let busy = false;

	const read = () =>
		document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";

	const apply = (mode: "light" | "dark") => {
		document.documentElement.setAttribute("data-theme", mode);
		btn.setAttribute("aria-pressed", String(mode === "dark"));
		const label = btn.querySelector(".toggle__label--mode");
		if (label) label.textContent = mode === "dark" ? "DK" : "LT";
		try {
			localStorage.setItem(KEY, mode);
		} catch {
			/* private mode — session only */
		}
	};

	apply(read());

	btn.addEventListener("click", () => {
		const next = read() === "dark" ? "light" : "dark";

		if (reduced || !wipe || bands.length === 0) {
			apply(next);
			return;
		}
		if (busy) return;
		busy = true;

		wipe.classList.add("is-live");

		gsap
			.timeline({
				onComplete: () => {
					wipe.classList.remove("is-live");
					busy = false;
				},
			})
			.set(bands, { transformOrigin: "left center", scaleX: 0 })
			.to(bands, {
				scaleX: 1,
				duration: 0.42,
				ease: "power3.inOut",
				stagger: 0.055,
			})
			.add(() => apply(next))
			.set(bands, { transformOrigin: "right center" })
			.to(bands, {
				scaleX: 0,
				duration: 0.42,
				ease: "power3.inOut",
				stagger: 0.055,
			});
	});
}
