/** Talk markdown AST — compiled from directive fences. */

export type TalkAccent = "purple" | "lime" | "orange" | "lavender";

/** Keep in sync with MOTIONS in show.ts. */
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
	"blur-in",
	"flip-x",
	"flip-y",
	"spin-in",
] as const;

export type MotionAttr = (typeof MOTION_ATTRS)[number];

export const MOTION_SET = new Set<string>(MOTION_ATTRS);

export const ACCENTS = ["purple", "lime", "orange", "lavender"] as const;

export interface TalkBlock {
	html?: string;
	step?: boolean;
	attrs: string[];
	molecule?: string;
	children?: TalkBlock[];
	label?: string;
	body?: string;
	letter?: string;
	accent?: TalkAccent;
}

export interface TalkSlide {
	attrs: string[];
	blocks: TalkBlock[];
}

export interface TalkDoc {
	slides: TalkSlide[];
}

export function pickAccent(attrs: string[], fallback: TalkAccent = "purple"): TalkAccent {
	for (const a of ACCENTS) {
		if (attrs.includes(a)) return a;
	}
	return fallback;
}

export function pickMotion(attrs: string[]): MotionAttr | null {
	for (const m of MOTION_ATTRS) {
		if (attrs.includes(m)) return m;
	}
	return null;
}

const SLIDE_KINDS = [
	"title",
	"break",
	"cta",
	"lead",
	"split",
	"letters",
	"altitude",
	"columns",
	"matter",
	"recap",
] as const;

/** `matter` shares the columns layout. */
export function slideKind(attrs: string[]): string {
	return SLIDE_KINDS.find((k) => attrs.includes(k)) ?? "body";
}

export function layoutClass(kind: string): string {
	if (kind === "body") return "layout-lead";
	if (kind === "matter") return "layout-columns";
	return `layout-${kind}`;
}
