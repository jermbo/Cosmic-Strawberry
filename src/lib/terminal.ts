import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(TextPlugin, ScrambleTextPlugin);

const GLYPHS = "01!<>-_\\/[]{}=+*^?#";

export type Terminal = {
	/** Type a line of output. */
	print: (text: string, options?: { className?: string; speed?: number }) => gsap.core.Timeline;
	/** Type a label, then decode a status into place after it. */
	check: (label: string, status?: string) => gsap.core.Timeline;
	/** Blank spacer line. */
	gap: () => gsap.core.Timeline;
	clear: () => void;
};

export function createTerminal(host: HTMLElement): Terminal {
	/**
	 * Lines are appended when their tween is *built*, not when it plays, so every
	 * new line starts hidden and reveals itself at the top of its own timeline.
	 */
	function line(className: string) {
		const el = document.createElement("div");
		el.className = className;
		el.style.opacity = "0";
		host.append(el);
		return el;
	}

	function scroll() {
		host.scrollTop = host.scrollHeight;
	}

	function print(text: string, options?: { className?: string; speed?: number }) {
		const el = line(`t-line ${options?.className ?? ""}`.trim());
		const speed = options?.speed ?? 55;

		return gsap.timeline().set(el, { opacity: 1 }).to(el, {
			text: { value: text, delimiter: "" },
			duration: text.length / speed,
			ease: "none",
			onUpdate: scroll,
		});
	}

	function check(label: string, status = "OK") {
		const el = line("t-line t-check");
		const labelEl = document.createElement("span");
		labelEl.className = "t-label";
		const leader = document.createElement("i");
		leader.className = "t-leader";
		const statusEl = document.createElement("span");
		statusEl.className = "t-status";
		el.append(labelEl, leader, statusEl);

		return gsap
			.timeline()
			.set(el, { opacity: 1 })
			.set([leader, statusEl], { opacity: 0 })
			.to(labelEl, {
				text: { value: label, delimiter: "" },
				duration: label.length / 90,
				ease: "none",
				onUpdate: scroll,
			})
			.to([leader, statusEl], { opacity: 1, duration: 0.12 })
			.to(statusEl, {
				duration: 0.35,
				scrambleText: { text: status, chars: GLYPHS, speed: 0.8 },
			})
			.add(() => {
				statusEl.classList.add("is-set");
				scroll();
			});
	}

	function gap() {
		const el = line("t-line t-gap");
		el.innerHTML = "&nbsp;";
		return gsap.timeline().set(el, { opacity: 1 });
	}

	return {
		print,
		check,
		gap,
		clear() {
			host.replaceChildren();
		},
	};
}
