/**
 * Small motion studies. Sourced from docs/ideas — one page each, eventually.
 * `href` is null until the demo exists; options render those as inert.
 */

export interface Experiment {
	idx: string;
	name: string;
	href: string | null;
	note: string;
	state: "built" | "sketched";
}

export const lab: Experiment[] = [
	{ idx: "L01", name: "Cold Boot", href: "/", note: "Terminal wakes the page up", state: "built" },
	{
		idx: "L02",
		name: "Constellation Assembly",
		href: "/",
		note: "Points find their lines",
		state: "built",
	},
	{ idx: "L03", name: "Cursor Gravity", href: null, note: "Letters lean toward the pointer", state: "sketched" },
	{ idx: "L04", name: "Hyperspace Jump", href: null, note: "Stars stretch, then snap", state: "sketched" },
	{ idx: "L05", name: "Strawberry Morph", href: null, note: "Mark folds into the wordmark", state: "sketched" },
	{ idx: "L06", name: "Zero G", href: null, note: "Type drifts off its baseline", state: "sketched" },
	{ idx: "L07", name: "Powers of Ten", href: null, note: "Scale as navigation", state: "sketched" },
	{ idx: "L08", name: "Singularity", href: null, note: "Everything falls to one point", state: "sketched" },
];
