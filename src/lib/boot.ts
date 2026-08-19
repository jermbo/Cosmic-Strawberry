import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { createTerminal, type Terminal } from "./terminal";

gsap.registerPlugin(SplitText, DrawSVGPlugin, ScrambleTextPlugin);

const GLYPHS = "01!<>-_\\/[]{}=+*^?#";

export type Boot = {
	terminal: () => Terminal | undefined;
	isBooting: () => boolean;
	skip: () => void;
	/** Re-run just the signal lock — used after a warp jump. */
	replayLock: () => gsap.core.Timeline | undefined;
	kill: () => void;
};

type Refs = {
	asciiRows: NodeListOf<Element>;
	ascii: Element;
	cosmic: Element;
	letters: NodeListOf<Element>;
	chars: Element[];
	comingSoon: Element;
	commands: Element;
	streak: Element;
};

export function playBoot(root: ParentNode): Boot {
	let killed = false;
	let split: SplitText | undefined;
	let ctx: gsap.Context | undefined;
	let terminal: Terminal | undefined;
	let bootTl: gsap.core.Timeline | undefined;
	let lockTl: gsap.core.Timeline | undefined;
	let refs: Refs | undefined;

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

		const host = root.querySelector<HTMLElement>(".boot");
		const ascii = root.querySelector(".ascii");
		const cosmic = root.querySelector(".cosmic");
		const strawberry = root.querySelector(".strawberry");
		const comingSoon = root.querySelector(".coming-soon");
		const commands = root.querySelector(".commands");
		const streak = root.querySelector(".streak");
		const letters = root.querySelectorAll(".cosmic .letter");

		if (!host || !ascii || !cosmic || !strawberry || !comingSoon || !commands || !streak) {
			document.documentElement.classList.remove("preload");
			return;
		}

		split = SplitText.create(strawberry, { type: "chars", charsClass: "char" });

		refs = {
			ascii,
			asciiRows: ascii.querySelectorAll(".ascii-row"),
			cosmic,
			letters,
			chars: split.chars,
			comingSoon,
			commands,
			streak,
		};

		terminal = createTerminal(host);

		ctx = gsap.context(() => {
			resetStage(refs!);
			document.documentElement.classList.remove("preload");
			bootTl = buildBoot(terminal!, refs!);
		}, root as Element);
	};

	void start();

	return {
		terminal: () => terminal,
		isBooting: () => Boolean(bootTl && bootTl.isActive()),
		skip() {
			bootTl?.progress(1);
		},
		replayLock() {
			if (!refs) {
				return undefined;
			}
			// A second jump mid-lock would otherwise run two locks over each other.
			lockTl?.kill();
			lockTl = buildLock(refs);
			return lockTl;
		},
		kill() {
			killed = true;
			ctx?.revert();
			split?.revert();
		},
	};
}

/** Put every stage element in its hidden pre-boot state before anything renders. */
function resetStage(refs: Refs) {
	gsap.set([refs.ascii, refs.cosmic, refs.commands, refs.comingSoon], { opacity: 0 });
	gsap.set(refs.chars, { opacity: 0 });
	gsap.set(refs.asciiRows, { opacity: 0 });
}

function buildBoot(term: Terminal, refs: Refs) {
	const tl = gsap.timeline();

	tl.add(term.print("COSMIC STRAWBERRY NAVIGATION SYSTEM", { className: "t-head" }))
		.add(term.print("FIRMWARE 0.0.1 // COLD BOOT"))
		.add(term.gap())
		.add(term.check("CORE MEMORY"))
		.add(term.check("STARFIELD ARRAY [300]"))
		.add(term.check("GRAVITY WELL"))
		.add(term.check("LONG RANGE SENSORS"))
		.add(term.check("FLAVOR SUBSYSTEM"))
		.add(term.check("SEED INDEX", "12,411"))
		.add(term.check("RIPENESS", "98%"))
		.add(term.gap())
		.add(term.print("> TRIANGULATING POSITION"))
		.add(buildLock(refs), ">-=0.1")
		.add(term.print("> SIGNAL LOCK // IDENTITY CONFIRMED", { className: "t-ok" }), "<+=2")
		.to(refs.commands, { opacity: 1, duration: 0.6, ease: "power2.out" }, ">-=0.5");

	return tl;
}

/**
 * The signal lock: the wordmark arrives as ASCII on a noisy channel, dissolves,
 * and the navigation system takes a proper star fix to resolve it for real.
 */
function buildLock(refs: Refs) {
	const tl = gsap.timeline();

	tl.set(refs.ascii, { opacity: 1 })
		.fromTo(
			refs.asciiRows,
			{ opacity: 0, x: () => gsap.utils.random(-30, 30) },
			{ opacity: 1, x: 0, duration: 0.35, stagger: 0.07, ease: "power2.out" },
		)
		.to(refs.ascii, { opacity: 0.35, duration: 0.06, repeat: 5, yoyo: true }, ">-0.1")
		.to(
			refs.asciiRows,
			{
				opacity: 0,
				x: () => gsap.utils.random(-60, 60),
				duration: 0.4,
				stagger: 0.05,
				ease: "power2.in",
			},
			">+=0.15",
		)
		.set(refs.ascii, { opacity: 0 })
		.set(refs.cosmic, { opacity: 1 }, "<");

	// Absolute positions from here — the pieces overlap too much for relative offsets.
	const lockStart = tl.duration() - 0.2;

	refs.letters.forEach((letter, i) => {
		tl.add(assembleLetter(letter), lockStart + i * 0.26);
	});

	const lettersEnd = tl.duration();
	tl.add(shootingStar(refs.streak), lettersEnd - 1.6);

	const charsStart = lettersEnd - 0.7;
	refs.chars.forEach((char, i) => {
		const at = charsStart + i * 0.07;
		const text = char.textContent ?? "";
		tl.set(char, { opacity: 1 }, at);
		tl.to(char, { duration: 0.5, scrambleText: { text, chars: GLYPHS, speed: 1 } }, at);
	});

	tl.fromTo(
		refs.comingSoon,
		{ opacity: 0 },
		{
			opacity: 1,
			duration: 0.9,
			scrambleText: { text: "coming soon", chars: GLYPHS, speed: 0.6 },
		},
		charsStart + refs.chars.length * 0.07 + 0.3,
	);

	return tl;
}

/** A letter resolves from a star fix: nodes, sight lines, then the real shape. */
function assembleLetter(letter: Element) {
	const nodes = letter.querySelectorAll(".c-node");
	const lines = letter.querySelectorAll(".c-line");
	const shape = letter.querySelector(".letter-shape");
	const tl = gsap.timeline();

	tl.fromTo(
		nodes,
		{ opacity: 0, scale: 0 },
		{ opacity: 1, scale: 1, duration: 0.4, stagger: 0.06, ease: "back.out(3)" },
	)
		.fromTo(
			lines,
			{ drawSVG: "0%", opacity: 0.55 },
			{ drawSVG: "100%", duration: 0.5, ease: "power2.inOut" },
			"-=0.2",
		)
		.fromTo(
			shape,
			{ opacity: 0, scale: 0.8 },
			{ opacity: 1, scale: 1, duration: 0.65, ease: "back.out(1.7)" },
			"-=0.15",
		)
		.to([...nodes, ...lines], { opacity: 0, duration: 0.55, ease: "power2.out" }, "-=0.45");

	return tl;
}

function shootingStar(streak: Element) {
	const w = window.innerWidth;
	return gsap.fromTo(
		streak,
		{ x: w / 2 + 300, y: -150, scale: 1, autoAlpha: 1, rotation: -135 },
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
