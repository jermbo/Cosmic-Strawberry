import { parseTalkMarkdown } from "./parse";
import { splitFrontmatter } from "./frontmatter";
import type { TalkDoc } from "./ast";

export interface TalkMeta {
	title: string;
	series: string;
	description: string;
	minutes?: number;
	date?: string;
}

export function loadTalk(source: string): { meta: TalkMeta; doc: TalkDoc } {
	const { data, body } = splitFrontmatter(source);
	return {
		meta: {
			title: String(data.title ?? "Untitled talk"),
			series: String(data.series ?? "TALK"),
			description: String(data.description ?? ""),
			minutes: typeof data.minutes === "number" ? data.minutes : undefined,
			date: data.date ? String(data.date) : undefined,
		},
		doc: parseTalkMarkdown(body),
	};
}
