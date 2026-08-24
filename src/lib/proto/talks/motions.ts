/**
 * Motion tokens + GSAP from-states. One source for parse (attr names) and show (tweens).
 */

export const MOTION_ATTRS = [
	"fade",
	"reveal-bottom",
	"reveal-top",
	"reveal-left",
	"reveal-right",
	"zoom-in",
	"zoom-out",
	"squish-in",
	"squish-out",
	"pop",
] as const;

export type MotionAttr = (typeof MOTION_ATTRS)[number];

export const MOTION_SET = new Set<string>(MOTION_ATTRS);

export type MotionSpec = {
	from: Record<string, string | number>;
	ease?: string;
};

export const MOTIONS: Record<MotionAttr, MotionSpec> = {
	fade: { from: { autoAlpha: 0, y: 8 } },
	"reveal-bottom": { from: { autoAlpha: 0, y: 28 } },
	"reveal-top": { from: { autoAlpha: 0, y: -28 } },
	"reveal-left": { from: { autoAlpha: 0, x: -32 } },
	"reveal-right": { from: { autoAlpha: 0, x: 32 } },
	"zoom-in": { from: { autoAlpha: 0, scale: 0.72 } },
	"zoom-out": { from: { autoAlpha: 0, scale: 1.28 } },
	"squish-in": { from: { autoAlpha: 0, scaleY: 0.08 }, ease: "power3.out" },
	"squish-out": { from: { autoAlpha: 0, scaleX: 1.5, scaleY: 0.28 }, ease: "power3.out" },
	pop: { from: { autoAlpha: 0, scale: 0.45 }, ease: "back.out(1.6)" },
};
