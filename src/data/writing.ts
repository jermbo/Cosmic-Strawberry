/** Long-form. Placeholder entries — only the first one has a real page. */

export interface Piece {
	idx: string;
	title: string;
	href: string;
	date: string;
	kind: string;
	minutes: number;
	blurb: string;
	variant: "stack" | "orbit" | "trace" | "nozzle";
}

export const writing: Piece[] = [
	{
		idx: "001",
		title: "Hard Vacuum",
		href: "/proto/crossings/hard-vacuum",
		date: "2026.04.11",
		kind: "Field note",
		minutes: 18,
		blurb: "What survives the space between two systems that were never meant to touch.",
		variant: "trace",
	},
	{
		idx: "002",
		title: "Second Stage",
		href: "/proto/crossings/hard-vacuum",
		date: "2026.03.02",
		kind: "Essay",
		minutes: 11,
		blurb: "On discarding the thing that got you off the ground, on schedule, without ceremony.",
		variant: "orbit",
	},
	{
		idx: "003",
		title: "Throat Diameter",
		href: "/proto/crossings/hard-vacuum",
		date: "2026.01.27",
		kind: "Teardown",
		minutes: 24,
		blurb: "Constraint as a design surface. The narrowest point does the most work.",
		variant: "nozzle",
	},
];
