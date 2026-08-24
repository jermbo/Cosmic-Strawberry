/**
 * Talks shelf for the hub. Each entry points at a full-bleed show under
 * `/proto/talks/…`. Adding a talk is a data edit plus a page.
 */

export interface Talk {
	idx: string;
	slug: string;
	title: string;
	href: string;
	/** Talk series label — e.g. TALK 201 */
	series: string;
	date: string;
	minutes: number;
	blurb: string;
	/** One word behind the hub cell */
	ghost: string;
	variant: "stack" | "orbit" | "trace" | "nozzle";
}

export const talks: Talk[] = [
	{
		idx: "T01",
		slug: "your-ai-has-amnesia",
		title: "Your AI Has Amnesia",
		href: "/proto/talks/your-ai-has-amnesia",
		series: "TALK 201",
		date: "2026.08",
		minutes: 25,
		blurb:
			"Writing code, docs, and tests for agents that forget everything between sessions.",
		ghost: "Amnesia",
		variant: "trace",
	},
];
