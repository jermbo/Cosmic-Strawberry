import gsap from "gsap";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import type { Intro } from "./intro";
import type { Starfield } from "./starfield";

gsap.registerPlugin(Physics2DPlugin);

const SECRET = "strawberry";

const CONFETTI_COLORS = [
	"#00F6FF",
	"#F7913D",
	"#AE4A9B",
	"#25B359",
	"#EF403E",
	"#A42132",
	"#FFFFFF",
];

export type Interactions = {
	jump: () => void;
	destroy: () => void;
};

/**
 * Click anywhere to jump to lightspeed and re-enter on a fresh sky.
 * Type the secret word to blow the wordmark apart and let it re-form.
 */
export function initInteractions(options: {
	root: ParentNode;
	starfield: Starfield;
	intro: Intro;
	flash: Element;
	hero: Element;
}): Interactions {
	const { root, starfield, intro, flash, hero } = options;
	let busy = false;
	let typed = "";

	function jump() {
		if (busy || starfield.isWarping()) {
			return;
		}
		busy = true;

		const tl = gsap.timeline({
			onComplete() {
				busy = false;
			},
		});

		tl.to(hero, { scale: 1.25, opacity: 0, duration: 0.75, ease: "power2.in" }, 0)
			.add(starfield.warp({ onPeak: () => intro.replay() }), 0)
			.to(flash, { opacity: 1, duration: 0.14, ease: "power2.in" }, 0.76)
			.to(flash, { opacity: 0, duration: 0.8, ease: "power2.out" }, 0.94);
	}

	function detonate() {
		if (busy) {
			return;
		}
		busy = true;

		const letters = root.querySelectorAll(".cosmic .letter");
		const chars = root.querySelectorAll(".strawberry .char");
		const comingSoon = root.querySelectorAll(".coming-soon");
		const pieces = [...letters, ...chars, ...comingSoon];

		burstConfetti(root.querySelector(".cosmic"));

		gsap.to(pieces, {
			duration: 1.8,
			physics2D: {
				velocity: "random(320, 780)",
				angle: "random(0, 360)",
				gravity: 0,
			},
			rotation: "random(-540, 540)",
			scale: "random(0.3, 1.4)",
			opacity: 0,
			ease: "none",
			stagger: { each: 0.02, from: "center" },
			onComplete() {
				gsap.set(pieces, { clearProps: "all" });
				intro.replay();
				busy = false;
			},
		});
	}

	function onClick(event: MouseEvent) {
		if (event.target instanceof Element && event.target.closest("a, button")) {
			return;
		}
		jump();
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1) {
			return;
		}
		typed = (typed + event.key.toLowerCase()).slice(-SECRET.length);
		if (typed === SECRET) {
			typed = "";
			detonate();
		}
	}

	window.addEventListener("click", onClick);
	window.addEventListener("keydown", onKeydown);

	return {
		jump,
		destroy() {
			window.removeEventListener("click", onClick);
			window.removeEventListener("keydown", onKeydown);
		},
	};
}

function burstConfetti(origin: Element | null) {
	if (!origin) {
		return;
	}

	const box = origin.getBoundingClientRect();
	const x = box.left + box.width / 2;
	const y = box.top + box.height / 2;

	const layer = document.createElement("div");
	layer.className = "confetti-layer";
	layer.setAttribute("aria-hidden", "true");

	const dots: HTMLElement[] = [];
	for (let i = 0; i < 70; i++) {
		const dot = document.createElement("span");
		dot.className = "confetti";
		dot.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
		dot.style.left = `${x}px`;
		dot.style.top = `${y}px`;
		layer.append(dot);
		dots.push(dot);
	}

	document.body.append(layer);

	gsap.to(dots, {
		duration: "random(1.2, 2.2)",
		physics2D: {
			velocity: "random(200, 900)",
			angle: "random(0, 360)",
			gravity: 0,
		},
		scale: "random(0.4, 1.6)",
		opacity: 0,
		ease: "power1.out",
		onComplete() {
			layer.remove();
		},
	});
}
