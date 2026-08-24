/** Talk markdown AST — compiled from directive fences. */

import { MOTION_ATTRS, MOTION_SET, type MotionAttr } from "./motions";

export type { MotionAttr };
export { MOTION_ATTRS, MOTION_SET };

export type TalkAccent = "purple" | "lime" | "orange" | "lavender";

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
	"figure",
	"gallery",
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
