/**
 * Talks shelf for the hub. Metadata comes from each talk's markdown frontmatter
 * (`title`, `series`, `description`, `minutes`, `date`, `idx`, `ghost`, `variant`).
 * Drop a `.md` under `src/content/talks/` and it shows up here automatically.
 */
import { loadTalk, slugFromPath, type TalkVariant } from "../lib/proto/talks/load";

export interface Talk {
	idx: string;
	slug: string;
	title: string;
	href: string;
	series: string;
	date: string;
	minutes: number;
	blurb: string;
	ghost: string;
	variant: TalkVariant;
}

const sources = import.meta.glob<string>("../content/talks/*.md", {
	query: "?raw",
	import: "default",
	eager: true,
});

export const talks: Talk[] = Object.entries(sources)
	.flatMap(([path, source]) => {
		const slug = slugFromPath(path);
		if (!slug) return [];
		const { meta } = loadTalk(source);
		return [
			{
				idx: meta.idx,
				slug,
				title: meta.title,
				href: `/proto/talks/${slug}`,
				series: meta.series,
				date: meta.date,
				minutes: meta.minutes,
				blurb: meta.description,
				ghost: meta.ghost,
				variant: meta.variant,
			},
		];
	})
	.sort((a, b) => a.idx.localeCompare(b.idx));
