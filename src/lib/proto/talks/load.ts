import { parseTalkMarkdown } from "./parse";
import { splitFrontmatter } from "./frontmatter";
import type { TalkDoc } from "./ast";

export type TalkVariant = "stack" | "orbit" | "trace" | "nozzle";

export interface TalkMeta {
	title: string;
	series: string;
	description: string;
	minutes: number;
	date: string;
	/** Hub shelf index, e.g. T01 */
	idx: string;
	/** Ghost word behind the hub cell */
	ghost: string;
	variant: TalkVariant;
}

const VARIANTS = new Set(["stack", "orbit", "trace", "nozzle"]);

export function loadTalk(source: string): { meta: TalkMeta; doc: TalkDoc } {
	const { data, body } = splitFrontmatter(source);
	const variantRaw = String(data.variant ?? "trace");
	const variant = (VARIANTS.has(variantRaw) ? variantRaw : "trace") as TalkVariant;

	return {
		meta: {
			title: String(data.title ?? "Untitled talk"),
			series: String(data.series ?? "TALK"),
			description: String(data.description ?? ""),
			minutes: typeof data.minutes === "number" ? data.minutes : Number(data.minutes) || 0,
			date: data.date ? String(data.date) : "",
			idx: String(data.idx ?? "T00"),
			ghost: String(data.ghost ?? data.title ?? "Talk"),
			variant,
		},
		doc: parseTalkMarkdown(body),
	};
}

/** Slug from a Vite glob path like `…/content/talks/foo.md`. */
export function slugFromPath(path: string): string | null {
	return path.match(/([^/]+)\.md$/)?.[1] ?? null;
}
