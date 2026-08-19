import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(SplitText, DrawSVGPlugin);

export type Intro = {
	replay: () => void;
	kill: () => void;
};

type Refs = {
	hero: Element;
	letters: NodeListOf<Element>;
	chars: Element[];
	comingSoon: Element;
	streak: Element;
};

export function playIntro(root: ParentNode): Intro {
	let killed = false;
	let split: SplitText | undefined;
	let ctx: gsap.Context | undefined;
	let timeline: gsap.core.Timeline | undefined;

	const start = async () => {
		if (document.fonts?.ready) {
			await Promise.race([
				document.fonts.ready,
				new Promise((resolve) => setTimeout(resolve, 1500)),
			]);
		}
		if (killed) {
			return;
		}

		const hero = root.querySelector(".hero");
		const letters = root.querySelectorAll(".cosmic .letter");
		const strawberry = root.querySelector(".strawberry");
		const comingSoon = root.querySelector(".coming-soon");
		const streak = root.querySelector(".streak");

		if (!hero || !letters.length || !strawberry || !comingSoon || !streak) {
			document.documentElement.classList.remove("preload");
			return;
		}

		split = SplitText.create(strawberry, { type: "chars", charsClass: "char" });
		const chars = split.chars;

		ctx = gsap.context(() => {
			timeline = buildTimeline({ hero, letters, chars, comingSoon, streak });
		}, root as Element);

		document.documentElement.classList.remove("preload");
	};

	void start();

	return {
		replay() {
			timeline?.restart();
		},
		kill() {
			killed = true;
			ctx?.revert();
			split?.revert();
		},
	};
}

function buildTimeline(refs: Refs) {
	const tl = gsap.timeline();

	tl.set(refs.hero, { opacity: 1, scale: 1 });

	refs.letters.forEach((letter, i) => {
		tl.add(assembleLetter(letter), 0.15 + i * 0.28);
	});

	tl.add(addStraw(refs.chars), "-=0.9")
		.add(shootingStar(refs.streak), "<")
		.add(addSoon(refs.comingSoon), "<+=1.1");

	return tl;
}

/**
 * A letter arrives as a constellation: stars appear, lines connect them,
 * the solid shape settles into the outline, and the scaffolding fades out.
 */
function assembleLetter(letter: Element) {
	const nodes = letter.querySelectorAll(".c-node");
	const lines = letter.querySelectorAll(".c-line");
	const shape = letter.querySelector(".letter-shape");
	const tl = gsap.timeline();

	tl.fromTo(
		nodes,
		{ opacity: 0, scale: 0 },
		{ opacity: 1, scale: 1, duration: 0.45, stagger: 0.07, ease: "back.out(3)" },
	)
		.fromTo(
			lines,
			{ drawSVG: "0%", opacity: 0.55 },
			{ drawSVG: "100%", duration: 0.6, ease: "power2.inOut" },
			"-=0.2",
		)
		.fromTo(
			shape,
			{ opacity: 0, scale: 0.8 },
			{ opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.7)" },
			"-=0.15",
		)
		.to([...nodes, ...lines], { opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.5");

	return tl;
}

function addStraw(chars: Element[]) {
	return gsap.from(chars, {
		opacity: 0,
		y: 25,
		rotationY: 360,
		duration: 3,
		stagger: 0.1,
		ease: "elastic.out",
		transformOrigin: "0% 10%",
	});
}

function addSoon(comingSoon: Element) {
	const tl = gsap.timeline({ delay: 1 });
	tl.from(comingSoon, {
		opacity: 0,
		letterSpacing: "15px",
		scale: 3,
		duration: 1.5,
		ease: "back.out",
		autoRound: false,
	});
	return tl;
}

function shootingStar(streak: Element) {
	const w = window.innerWidth;
	return gsap.fromTo(
		streak,
		{
			x: w / 2 + 300,
			y: -150,
			scale: 1,
			autoAlpha: 1,
			rotation: -135,
		},
		{
			x: w / 2 + 300 - 750,
			y: -150 + 750,
			scale: 0,
			autoAlpha: 0,
			duration: 1,
			ease: "power2.in",
		},
	);
}
