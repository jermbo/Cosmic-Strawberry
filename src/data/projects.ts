/**
 * The projects the hub exists to point at. Every IA option renders from this
 * one array — adding a project is a data edit, not four page edits.
 *
 * `pos` is a percentage coordinate used only by the spatial option (04). It is
 * ignored everywhere else; a new project without one still renders in the
 * other three layouts.
 */

export interface Project {
	idx: string;
	name: string;
	href: string;
	host: string;
	/** One line, sentence case, no marketing. */
	blurb: string;
	/** The one word the project is really about — used as a big label. */
	keyword: string;
	status: "live" | "building" | "parked";
	tags: string[];
	/** Schematic mark that stands in for the project until it has its own. */
	variant: "stack" | "orbit" | "trace" | "nozzle";
	/** Accent it flies under. Three flat colours, per the stripe. */
	accent: "red" | "orange" | "blue";
	/** Spatial position for option 04, as [x%, y%] of the map. */
	pos: [number, number];
	/** Other project idx values this one is related to. Drawn as links on 04. */
	links: string[];
}

export const projects: Project[] = [
	{
		idx: "01",
		name: "View Source",
		href: "https://viewsource.cosmicstrawberry.com/",
		host: "viewsource",
		blurb:
			"An exploration of how to get AI not to suck at design, by starting with the history of design.",
		keyword: "History",
		status: "live",
		tags: ["AI", "Design", "Research"],
		variant: "stack",
		accent: "red",
		pos: [22, 30],
		links: ["03"],
	},
	{
		idx: "02",
		name: "Typer",
		href: "https://typer.cosmicstrawberry.com/",
		host: "typer",
		blurb: "A reimagined and modernised tool from the Code Palm Beach days.",
		keyword: "Practice",
		status: "live",
		tags: ["Tool", "Teaching", "Rebuild"],
		variant: "trace",
		accent: "orange",
		pos: [72, 22],
		links: [],
	},
	{
		idx: "03",
		name: "Astra Opus",
		href: "https://astra-opus.cosmicstrawberry.com/",
		host: "astra-opus",
		blurb: "An exploration of creativity in the age of AI.",
		keyword: "Creativity",
		status: "live",
		tags: ["AI", "Writing", "Essay"],
		variant: "orbit",
		accent: "blue",
		pos: [40, 68],
		links: ["01"],
	},
	{
		idx: "04",
		name: "Workout",
		href: "https://workout.cosmicstrawberry.com/",
		host: "workout",
		blurb:
			"A custom workout app, habit and activity tracker, and health monitor. Installable PWA, works offline.",
		keyword: "Measure",
		status: "live",
		tags: ["PWA", "Offline", "Health"],
		variant: "nozzle",
		accent: "orange",
		pos: [80, 74],
		links: [],
	},
];
