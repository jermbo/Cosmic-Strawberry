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
};

export type Starfield = {
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
		return { destroy() {} };
	}

	const stars: Star[] = [];
	let width = 0;
	let height = 0;

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

		for (const star of stars) {
			let alpha = star.baseAlpha;
			if (twinkle && star.twinkles) {
				alpha =
					star.baseAlpha *
					(0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase)));
			}

			ctx.fillStyle = `rgba(${CYAN}, ${alpha})`;
			ctx.beginPath();
			ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	const tick: gsap.TickerCallback = (time) => {
		draw(time);
	};

	const observer = new ResizeObserver(resize);
	observer.observe(canvas);
	resize();

	if (twinkle) {
		gsap.ticker.add(tick);
	}

	return {
		destroy() {
			observer.disconnect();
			gsap.ticker.remove(tick);
		},
	};
}
