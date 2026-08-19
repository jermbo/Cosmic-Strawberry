import gsap from "gsap";

const STAR_COUNT = 300;
const CYAN = "0, 246, 255";

type Star = {
	x: number;
	y: number;
	r: number;
	baseAlpha: number;
	twinkleSpeed: number;
	twinklePhase: number;
	twinkles: boolean;
	depth: number;
};

export type Starfield = {
	warp: (options?: { onPeak?: () => void }) => gsap.core.Timeline;
	isWarping: () => boolean;
	destroy: () => void;
};

export function createStarfield(
	canvas: HTMLCanvasElement,
	options?: { twinkle?: boolean; count?: number },
): Starfield {
	const twinkle = options?.twinkle ?? true;
	const count = options?.count ?? STAR_COUNT;
	const ctx = canvas.getContext("2d");

	if (!ctx) {
		return { warp: () => gsap.timeline(), isWarping: () => false, destroy() {} };
	}

	const stars: Star[] = [];
	const state = { warp: 0 };
	let width = 0;
	let height = 0;
	let tickerActive = false;
	let warping = false;

	function seed() {
		stars.length = 0;
		for (let i = 0; i < count; i++) {
			stars.push({
				x: Math.random(),
				y: Math.random(),
				r: Math.random() * 1.8 + 0.4,
				baseAlpha: Math.random() * 0.7 + 0.2,
				twinkleSpeed: Math.random() * 2 + 0.6,
				twinklePhase: Math.random() * Math.PI * 2,
				twinkles: i < count / 10,
				depth: Math.random() * 0.8 + 0.4,
			});
		}
	}

	function resize() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		canvas.width = Math.floor(width * dpr);
		canvas.height = Math.floor(height * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		if (stars.length === 0) {
			seed();
		}
		draw(gsap.ticker.time);
	}

	function draw(time: number) {
		ctx.clearRect(0, 0, width, height);
		ctx.shadowColor = `rgb(${CYAN})`;
		ctx.shadowBlur = 6;
		ctx.lineCap = "round";

		const warp = state.warp;
		const cx = width / 2;
		const cy = height / 2;

		for (const star of stars) {
			let alpha = star.baseAlpha;
			if (twinkle && star.twinkles) {
				alpha =
					star.baseAlpha *
					(0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase)));
			}

			const sx = star.x * width;
			const sy = star.y * height;

			if (warp < 0.001) {
				ctx.fillStyle = `rgba(${CYAN}, ${alpha})`;
				ctx.beginPath();
				ctx.arc(sx, sy, star.r, 0, Math.PI * 2);
				ctx.fill();
				continue;
			}

			// Push each star away from center along its own radial, then trail it.
			const dx = sx - cx;
			const dy = sy - cy;
			const dist = Math.hypot(dx, dy) || 1;
			const ux = dx / dist;
			const uy = dy / dist;

			const push = warp * warp * (dist * 1.7 + 140) * star.depth;
			const px = sx + ux * push;
			const py = sy + uy * push;
			const len = warp * (60 + dist * 0.55) * star.depth;

			ctx.strokeStyle = `rgba(${CYAN}, ${Math.min(1, alpha + warp * 0.5)})`;
			ctx.lineWidth = star.r * 1.3;
			ctx.beginPath();
			ctx.moveTo(px - ux * len, py - uy * len);
			ctx.lineTo(px, py);
			ctx.stroke();
		}
	}

	const tick: gsap.TickerCallback = (time) => {
		draw(time);
	};

	function addTicker() {
		if (!tickerActive) {
			gsap.ticker.add(tick);
			tickerActive = true;
		}
	}

	function removeTicker() {
		if (tickerActive) {
			gsap.ticker.remove(tick);
			tickerActive = false;
		}
	}

	const observer = new ResizeObserver(resize);
	observer.observe(canvas);
	resize();

	if (twinkle) {
		addTicker();
	}

	function warp(options?: { onPeak?: () => void }) {
		const tl = gsap.timeline({
			onStart() {
				warping = true;
				addTicker();
			},
			onComplete() {
				warping = false;
				if (!twinkle) {
					removeTicker();
					draw(gsap.ticker.time);
				}
			},
		});

		tl.to(state, { warp: 1, duration: 0.9, ease: "power3.in" })
			.add(() => {
				// New sky on the other side of the jump.
				seed();
				state.warp = 0.55;
				options?.onPeak?.();
			})
			.to(state, { warp: 0, duration: 1.4, ease: "power2.out" });

		return tl;
	}

	return {
		warp,
		isWarping: () => warping,
		destroy() {
			observer.disconnect();
			removeTicker();
		},
	};
}
