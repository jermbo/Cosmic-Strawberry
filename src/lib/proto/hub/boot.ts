/**
 * The load sequence for hub option 06.
 *
 * A deck is not a document, so it does not get a document's load. Two beats,
 * overlapped:
 *
 *   1. REGISTER — the world settles into the frame from above, the way a
 *      mechanism finds its detent. This is the deck's own gesture, performed
 *      once before anyone has touched it, so the first thing the page teaches
 *      is that it translates rather than scrolls.
 *   2. DRAFT — the masthead assembles inside the now-registered frame: rule
 *      from the left, wordmark out of a mask, core section drawing itself,
 *      stripe landing, copy last. This is `playHero()`'s vocabulary, because
 *      row 00 *is* the index hero.
 *
 * The page runs `motion="manual"`, which means `settle()` never fires and
 * nothing here is fighting a state someone else already set. Everything below
 * row 00 is left alone — the deck draws each row's line-work the first time
 * that row is entered.
 */
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { drawFigure, assembleStripe, maskLines } from "../reveal";

gsap.registerPlugin(SplitText, ScrambleTextPlugin);

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * How far above its resting position the world starts, as a percentage of the
 * deck. Expressed as a unit rather than measured: `.deck__world` is `inset: 0`,
 * so 30% of it *is* 30% of the deck, and a boot that runs before layout has
 * settled — or in a tab that reports zero geometry — still registers properly.
 */
const REGISTER = -30;

/** Glyph set the mono readouts resolve out of. Matches the landing-page boot. */
const GLYPHS = "01!<>-_\\/[]{}=+*^?#";

export function playDeckBoot(): void {
	const deck = document.querySelector<HTMLElement>("[data-deck]");
	const world = deck?.querySelector<HTMLElement>("[data-world]");
	const mast = deck?.querySelector<HTMLElement>(".mast");
	if (!deck || !world || !mast) return;

	const firstRow = deck.querySelector<HTMLElement>("[data-row]");
	/* the boot owns row 00's figure, so the deck must not draw it again */
	if (firstRow) firstRow.dataset.drawn = "true";

	const progress = deck.querySelector<HTMLElement>("[data-progress]");
	const chrome = Array.from(
		deck.querySelectorAll<HTMLElement>(".sections button, .down")
	);

	const meta = Array.from(mast.querySelectorAll<HTMLElement>(".mast__meta span"));
	const rule = mast.querySelector<HTMLElement>(".rule");
	const word = mast.querySelector<HTMLElement>(".display");
	const stripe = mast.querySelector<HTMLElement>(".mast__stripe");
	const fig = mast.querySelector<HTMLElement>("[data-fig]");
	const caption = mast.querySelector<HTMLElement>(".mast__figure figcaption");
	const ghost = deck.querySelector<HTMLElement>(".cell--mast [data-ghost]");
	const scan = deck.querySelector<HTMLElement>("[data-scan]");
	const copy = Array.from(
		mast.querySelectorAll<HTMLElement>(".lede, .mast__specs")
	);

	if (reduced()) {
		place(mast, progress);
		return;
	}

	const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

	/* ---- 1. register ------------------------------------------------------ */

	/*
	 * Downward, never up: the world starts high (a negative `yPercent`) and
	 * descends into the frame. Coming from below
	 * would read as content rising over the fold, which the motion rules
	 * disallow, and a full row of travel would flash the Projects cells on the
	 * way past. A third of a viewport is enough to read as movement and short
	 * enough that only a dimmed sliver of row 01 is ever exposed.
	 */
	tl.fromTo(
		world,
		{ yPercent: REGISTER },
		{ yPercent: 0, duration: 1.2, ease: "expo.out" },
		0
	);

	/*
	 * The ghost word travels with the register rather than being present for
	 * it. Leftward, so it resolves along the reading direction — the deck's
	 * own arrival slides it the other way, but that one is answering a drag
	 * and this one is answering nothing.
	 */
	if (ghost) {
		tl.fromTo(ghost, { x: -80 }, { x: 0, duration: 1.4, ease: "expo.out" }, 0);
	}

	/*
	 * THE SIGNAL LOCK. The masthead claims `SIG ◉ LOCKED`, so the load earns
	 * it: one scanline crosses the deck, the whole masthead displaces by a few
	 * pixels in hard steps, and the mono readouts resolve out of noise. This is
	 * the one place the "nothing plays on a timer" rule is spent, and it is
	 * spent on a transition — it happens once and can never happen again.
	 */
	if (scan) {
		tl.fromTo(
			scan,
			{ y: 0, opacity: 0.5 },
			{ y: "100vh", opacity: 0, duration: 0.45, ease: "none" },
			0.3
		);
	}

	/* steps, not eases — a dropped frame reads as a fault, a smooth slide reads as decoration */
	tl.fromTo(mast, { x: 5 }, { x: 0, duration: 0.14, ease: "steps(3)" }, 0.3);

	/* the fixed chrome is the frame the world registers into, so it lands first */
	tl.fromTo(
		chrome,
		{ opacity: 0, y: 8 },
		{ opacity: 1, y: 0, duration: 0.6, stagger: 0.05 },
		0.06
	);

	if (progress) tl.add(assembleStripe(progress), 0.2);

	/* ---- 2. draft --------------------------------------------------------- */

	/*
	 * `SIG ◉ LOCKED` is the last of the three, so the lock is literally the
	 * last thing to resolve — which is the only order that means anything.
	 */
	meta.forEach((n, i) => {
		const at = 0.4 + i * 0.06;
		const text = n.textContent ?? "";
		tl.fromTo(n, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.5 }, at);
		tl.to(
			n,
			{
				duration: 0.6,
				ease: "none",
				scrambleText: { text, chars: GLYPHS, speed: 0.6, revealDelay: 0.1 },
			},
			at
		);
	});

	if (rule) {
		rule.classList.add("is-set");
		tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.95, ease: "expo.out" }, 0.46);
	}

	if (word) {
		/* maskLines keeps the heading's accessible name across the split */
		const split = maskLines(word);
		gsap.set(word, { opacity: 1 });
		tl.from(
			split.lines,
			{ yPercent: 112, duration: 1.05, ease: "expo.out", stagger: 0.085 },
			0.52
		);
	}

	/* the drawing starts before the stripe lands, so the two share the screen */
	if (fig) tl.add(drawFigure(fig), 0.76);
	if (stripe) {
		tl.add(assembleStripe(stripe), 0.86);
		/* off register by a hair on landing, corrected in two frames */
		tl.fromTo(stripe, { x: -4 }, { x: 0, duration: 0.16, ease: "steps(2)" }, 0.92);
	}

	/* the caption is the drawing's annotation, so it may not precede it */
	if (caption) {
		tl.fromTo(caption, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none" }, 1.06);
	}

	copy.forEach((n, i) => {
		tl.fromTo(n, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 1.04 + i * 0.07);
	});
}

/** Reduced motion is a designed state: everything placed, nothing moving. */
function place(mast: HTMLElement, progress: HTMLElement | null): void {
	/* nothing is left mid-tween, because no tween ever ran */
	mast.querySelectorAll(".stripe").forEach((s) => s.classList.add("is-set"));
	mast.querySelectorAll(".rule").forEach((r) => r.classList.add("is-set"));
	mast.querySelectorAll<HTMLElement>("[data-fig]").forEach((f) => {
		f.style.opacity = "1";
	});
	progress?.classList.add("is-set");
}
