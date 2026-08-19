import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export type Intro = {
	kill: () => void;
};

export function playIntro(root: ParentNode): Intro {
	let killed = false;
	let split: SplitText | undefined;
	let ctx: gsap.Context | undefined;

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

		const cosmic = root.querySelectorAll(".cosmic .letter");
		const strawberry = root.querySelector(".strawberry");
		const comingSoon = root.querySelector(".coming-soon");
		const streak = root.querySelector(".streak");

		if (!cosmic.length || !strawberry || !comingSoon || !streak) {
			document.documentElement.classList.remove("preload");
			return;
		}

		split = SplitText.create(strawberry, { type: "chars", charsClass: "char" });
		const chars = split.chars;

		ctx = gsap.context(() => {
			const tl = gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 5 });
			tl.add(addCosmic(cosmic), "start")
				.add(addStraw(chars), "start+=0.75")
				.add(shootingStar(streak), "start+=0.75")
				.add(addSoon(comingSoon));
		}, root as Element);

		document.documentElement.classList.remove("preload");
	};

	void start();

	return {
		kill() {
			killed = true;
			ctx?.revert();
			split?.revert();
		},
	};
}

function addCosmic(letters: NodeListOf<Element>) {
	const mid = (letters.length - 1) / 2;
	return gsap.from(letters, {
		opacity: 0,
		scale: 0,
		x: (i) => (mid - i) * 48,
		duration: 2,
		stagger: 0.25,
		ease: "back.out",
	});
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
