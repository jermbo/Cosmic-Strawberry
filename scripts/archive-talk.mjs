/**
 * Faithfully convert legacy talk markdown into Cosmic Strawberry talk fences.
 * Splits on ## / ###, rewrites image paths, injects sidecar images by section.
 *
 * Usage: node scripts/archive-talk.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, ".tmp-talks-src");
const OUT = path.join(ROOT, "src/content/talks");

const ACCENTS = ["orange", "lime", "purple", "lavender"];

// Each talk: source md, hub meta, public asset dir, optional imagesByHeading map.
const TALKS = [
	{
		source: "AdvancedSass.md",
		slug: "advanced-sass",
		series: "TALK 102",
		description: "BEM, nesting, maps, loops, mixins, functions, and why not to @extend.",
		minutes: 45,
		date: "2018.01",
		idx: "T04",
		ghost: "Sass",
		variant: "orbit",
		accent: "lime",
		assetDir: "advanced-sass",
		imagesByHeading: {
			"intro to bem": ["01-block.png", "02-element.png", "03-modifier.png"],
			"proper nesting": [
				"04-bad-nesting-scss.png",
				"05-bad-nesting-css.png",
				"06-good-nesting-scss.png",
				"07-good-nesting-css.png",
			],
			"bem rule tweak": ["08-modifier-tweak.png", "08-modifier-tweak-output.png"],
			"sass variables": ["09-sass-vars.png", "10-sass-vars-use.png"],
			"sass maps": [
				"11-sass-maps.png",
				"11-sass-maps-loops.png",
				"13-sass-maps-loops-output.png",
				"14-sass-maps-loops-advanced.png",
				"15-sass-maps-loops-advanced-loop.png",
			],
			mixins: ["16-mixins.png", "17-mixins-breakpoints.png", "18-mixins-breakpoints-usage.png"],
			functions: ["19-functions.png"],
			"@extends": [
				"20-extend-issue.png",
				"21-extend-issue.png",
				"22-extend-issue.png",
				"23-extend-issue.png",
			],
			extends: [
				"20-extend-issue.png",
				"21-extend-issue.png",
				"22-extend-issue.png",
				"23-extend-issue.png",
			],
		},
	},
	{
		source: "CSSPreProcessors.md",
		slug: "css-preprocessors",
		series: "TALK 103",
		description: "Partials, nesting, maps, loops, and functions — why preprocessors still earn their keep.",
		minutes: 40,
		date: "2017.01",
		idx: "T05",
		ghost: "Preprocess",
		variant: "trace",
		accent: "orange",
		assetDir: "css-preprocessors",
		imagesByHeading: {
			nesting: [
				"nesting-regular.png",
				"nesting-sass.png",
				"bem-markup.png",
				"bem-nesting-1.png",
				"bem-nesting-2.png",
				"bem-nesting-proper-1.png",
				"bem-nesting-proper-2.png",
				"bem-nesting-proper-3.png",
				"bem-nesting-proper-4.png",
			],
			maps: ["sass-maps.png", "sass-map-1.png", "sass-map-2.png", "sass-access.png", "sass-lists.png"],
			loops: ["sass-loops.png", "sass-loops-2.png"],
			functions: [
				"sass-func-1.png",
				"sass-func-2.png",
				"color-error.png",
				"min-max-error.png",
				"funcs-solution.png",
			],
		},
	},
	{
		source: "CSSVariables.md",
		slug: "css-variables",
		series: "TALK 104",
		description: "CSS custom properties — what, how, and why, including themes and media queries.",
		minutes: 30,
		date: "2019.01",
		idx: "T06",
		ghost: "Variables",
		variant: "stack",
		accent: "purple",
		assetDir: "css-variables",
		imagesByHeading: {
			syntax: ["01-syntax.png", "02-syntax.png"],
			"scope and cascade": ["03-cascade.png"],
			"media queries": [
				"04-Media-Queries-Sass.png",
				"05-Media-Queries-Sass.png",
				"06-Media-Queries-CSS.png",
				"07-Media-Queries-CSS.png",
			],
			"alert system": ["08-Alert-HTML.png", "09-Alert-CSS.png", "10-Alert-CSS.png"],
			"light and dark": ["11-Dark-Mode.png"],
		},
	},
	{
		source: "CleanCode.md",
		slug: "clean-code",
		series: "TALK 105",
		description: "Code is for humans — formatting, naming, specificity, and front-end code smells.",
		minutes: 40,
		date: "2017.06",
		idx: "T07",
		ghost: "Clean",
		variant: "nozzle",
		accent: "lavender",
		assetDir: "clean-code",
	},
	{
		source: "ScratchYourOwnItch.md",
		slug: "scratch-your-own-itch",
		series: "TALK 106",
		description: "Why personal projects matter — and how Sample APIs grew from scratching an itch.",
		minutes: 30,
		date: "2019.06",
		idx: "T08",
		ghost: "Itch",
		variant: "orbit",
		accent: "lime",
		assetDir: "scratch-your-own-itch",
	},
	{
		source: "ScratchYourOwnItch-v2.md",
		slug: "scratch-your-own-itch-v2",
		series: "TALK 106b",
		description: "Scratch Your Own Itch (v2) — personal projects, Sample APIs, and keeping up with the industry.",
		minutes: 25,
		date: "2020.01",
		idx: "T09",
		ghost: "Itch",
		variant: "trace",
		accent: "orange",
		assetDir: "scratch-your-own-itch-v2",
	},
	{
		source: "RESTful-Intro.md",
		slug: "restful-introduction",
		series: "TALK 107",
		description: "REST, CRUD, and a hands-on intro to working with APIs.",
		minutes: 35,
		date: "2018.06",
		idx: "T10",
		ghost: "REST",
		variant: "stack",
		accent: "purple",
		assetDir: "restful-introduction",
	},
	{
		source: "IntroToStrapi.md",
		slug: "intro-to-strapi",
		series: "TALK 108",
		description: "Intro to Strapi — headless CMS, JAMstack, and thinking outside the blog.",
		minutes: 30,
		date: "2020.06",
		idx: "T11",
		ghost: "Strapi",
		variant: "orbit",
		accent: "lavender",
		assetDir: "strapi",
		archiveLeftovers: false,
	},
	{
		source: "StrapiUseCase.md",
		slug: "strapi-use-case",
		series: "TALK 109",
		description: "Strapi in practice — building Typer as a JAMstack app with auth and CRUD.",
		minutes: 25,
		date: "2020.09",
		idx: "T12",
		ghost: "Typer",
		variant: "nozzle",
		accent: "lime",
		assetDir: "strapi",
	},
	{
		source: "UnderutilizedCSS.md",
		slug: "underutilized-css",
		series: "TALK 110",
		description: "CSS features that do not get enough use — box-sizing, calc, flex, grid, custom properties, and more.",
		minutes: 40,
		date: "2019.03",
		idx: "T13",
		ghost: "CSS",
		variant: "trace",
		accent: "orange",
		assetDir: "underutilized",
		imagesByHeading: {
			"box sizing": ["css/00-box-model.png", "css/01-box-sizing.png"],
			calc: ["css/02-calc-basic.png", "css/03-calc-advanced.png"],
			"css grids": ["css/04-grid-html.png", "css/05-grid-css.png"],
			"custom properties": [
				"css/06-sass-variables.png",
				"css/07-css-variables.png",
				"css/08-css-cascade.png",
				"css/09-scss-media.png",
				"css/09-scss-mediaaa.png",
				"css/10-scss-media.png",
				"css/11-css-media.png",
				"css/12-css-media.png",
			],
			empty: ["css/13-not.png"],
		},
	},
	{
		source: "UnderutilizedJavaScript.md",
		slug: "underutilized-javascript",
		series: "TALK 111",
		description: "JavaScript features that deserve more airtime in day-to-day front-end work.",
		minutes: 35,
		date: "2019.03",
		idx: "T14",
		ghost: "JS",
		variant: "stack",
		accent: "purple",
		assetDir: "underutilized",
		archiveLeftovers: false,
	},
	{
		source: "VueAndVuex.md",
		slug: "vue-and-vuex",
		series: "TALK 112",
		description: "Managing global state in Vue with Vuex.",
		minutes: 30,
		date: "2019.08",
		idx: "T15",
		ghost: "Vuex",
		variant: "orbit",
		accent: "lime",
		assetDir: "vue-and-vuex",
	},
	{
		source: "VueTypeScript.md",
		slug: "vue-typescript",
		series: "TALK 113",
		description: "First-hand notes on using TypeScript in a Vue app — setup, Vuex, props, and more.",
		minutes: 40,
		date: "2020.02",
		idx: "T16",
		ghost: "VueTS",
		variant: "trace",
		accent: "orange",
		assetDir: "vue-typescript",
		imagesByHeading: {
			"vue components": ["10-vue-components.png"],
			"tsconfig.json": ["11-ts-config.png"],
			"vue router": ["12-vue-router.png"],
			"index and rootstate": ["13-vuex-index.png", "14-vuex-rootstate.png"],
			"user interface": ["15-vuex-user-interfaces.png"],
			"user module index": [
				"16-vuex-state-old.png",
				"17-vuex-state-new.png",
				"21-vuex-user-index.png",
			],
			getters: ["18-vuex-getters.png"],
			actions: ["19-vuex-actions.png"],
			mutations: ["20-vuex-mutations.png"],
			"vue config": ["22-vue-config.png", "23-vue-config-useage.png"],
			"typescript config": ["34-ts-config.png"],
			props: ["35-props.png"],
			"computed properties": ["36-computed-properties.png", "37-custom-methods.png"],
		},
	},
	{
		source: "WhyILoveVue.md",
		slug: "why-i-love-vue",
		series: "TALK 114",
		description: "Why I love Vue — CLI, SFCs, router, and Vuex.",
		minutes: 15,
		date: "2018.09",
		idx: "T17",
		ghost: "Vue",
		variant: "nozzle",
		accent: "lavender",
		assetDir: "why-i-love-vue",
	},
];

function rewriteImages(body, assetDir) {
	let out = body;
	// Inline markdown images
	out = out.replace(/!\[([^\]]*)\]\((?:\.\/)?images\/([^)]+)\)/g, (_, alt, file) => {
		return `![${alt}](/talks/${assetDir}/${file})`;
	});
	// Reference definitions: [id]: ./images/foo.png
	out = out.replace(
		/^\[([^\]]+)\]:\s*(?:\.\/)?images\/(\S+)/gm,
		(_, id, file) => `[${id}]: /talks/${assetDir}/${file}`,
	);
	return out;
}

function resolveReferenceImages(body) {
	const defs = new Map();
	const withoutDefs = body.replace(/^\[([^\]]+)\]:\s+(\S+)\s*$/gm, (_, id, url) => {
		defs.set(id, url);
		return "";
	});
	return withoutDefs.replace(/!\[([^\]]*)\]\[([^\]]+)\]/g, (_, alt, id) => {
		const url = defs.get(id);
		if (!url) return `![${alt}][${id}]`;
		return `![${alt}](${url})`;
	});
}

function splitSections(md) {
	const lines = md.replace(/\r\n/g, "\n").split("\n");
	/** @type {{ level: number, title: string, body: string }[]} */
	const sections = [];
	let title = "";
	let intro = [];
	let current = null;

	const flush = () => {
		if (current) {
			current.body = current.body.replace(/^\n+|\n+$/g, "");
			sections.push(current);
			current = null;
		}
	};

	for (const line of lines) {
		const h = line.match(/^(#{1,4})\s+(.+)$/);
		if (h) {
			const level = h[1].length;
			const text = h[2].trim();
			if (level === 1 && !title) {
				title = text;
				continue;
			}
			if (level <= 3) {
				flush();
				current = { level, title: text, body: "" };
				continue;
			}
		}
		if (!current && !title) {
			// skip leading blanks before title
			if (line.trim()) intro.push(line);
			continue;
		}
		if (!current) {
			intro.push(line);
			continue;
		}
		current.body += line + "\n";
	}
	flush();

	return {
		title,
		intro: intro.join("\n").replace(/^\n+|\n+$/g, ""),
		sections,
	};
}

function pickLayout(body) {
	const imgs = [...body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1]);
	if (imgs.length >= 2) return "gallery";
	if (imgs.length === 1) return "figure";
	if (/```/.test(body) && body.length > 800) return "lead";
	return "lead";
}

function imagesMarkdown(files, assetDir) {
	return files
		.map((f) => {
			const alt = path.basename(f, path.extname(f)).replace(/[-_]/g, " ");
			return `![${alt}](/talks/${assetDir}/${f})`;
		})
		.join("\n\n");
}

function matchImages(heading, imagesByHeading, used) {
	if (!imagesByHeading) return [];
	const key = heading.toLowerCase();
	const matched = [];
	for (const [needle, files] of Object.entries(imagesByHeading)) {
		if (key.includes(needle.toLowerCase())) {
			for (const f of files) {
				if (!used.has(f)) {
					used.add(f);
					matched.push(f);
				}
			}
		}
	}
	return matched;
}

function collectUsedFromBody(body, assetDir, used) {
	const re = new RegExp(`/talks/${assetDir}/([^)\\s]+)`, "g");
	for (const m of body.matchAll(re)) used.add(m[1]);
}

function buildTalk(cfg) {
	const raw = fs.readFileSync(path.join(SRC, cfg.source), "utf8");
	let body = rewriteImages(raw, cfg.assetDir);
	body = resolveReferenceImages(body);

	const { title, intro, sections } = splitSections(body);
	const talkTitle = cfg.title ?? title;
	const used = new Set();
	collectUsedFromBody(body, cfg.assetDir, used);
	const accent = cfg.accent;
	const slides = [];

	slides.push(`::slide[title fade ${accent}]

_${cfg.series}_

# ${talkTitle}

${intro.split("\n\n")[0]?.trim() || cfg.description}
`);

	if (intro.trim()) {
		const rest = intro.split("\n\n").slice(1).join("\n\n").trim();
		const first = intro.split("\n\n")[0]?.trim() ?? "";
		if (rest || (first && first !== slides[0])) {
			slides.push(`::slide[lead ${accent}]

_INTRO_

## ${talkTitle}

${intro}
`);
		}
	}

	for (const section of sections) {
		const imgs = matchImages(section.title, cfg.imagesByHeading, used);
		let content = section.body.trim();
		if (imgs.length) {
			content = [content, imagesMarkdown(imgs, cfg.assetDir)].filter(Boolean).join("\n\n");
		}

		if (section.level === 2 && !content) {
			slides.push(`::slide[break ${accent}]

_${cfg.series}_

# ${section.title}
`);
			continue;
		}

		if (section.level === 2 && content.length < 280 && !/```|!\[[^\]]*\]\(/.test(content)) {
			slides.push(`::slide[break ${ACCENTS[(ACCENTS.indexOf(accent) + 1) % ACCENTS.length]}]

_${section.title.toUpperCase()}_

# ${section.title}
`);
			if (content) {
				const layout = pickLayout(content);
				slides.push(`::slide[${layout} ${accent}]

_${section.title.toUpperCase()}_

## ${section.title}

${content}
`);
			}
			continue;
		}

		const layout = pickLayout(content);
		const kicker =
			section.level === 2
				? section.title.toUpperCase()
				: sections.find((s) => s.level === 2 && sections.indexOf(s) < sections.indexOf(section))
						?.title?.toUpperCase() ?? cfg.series;

		slides.push(`::slide[${layout} ${accent}]

_${kicker}_

## ${section.title}

${content}
`);
	}

	// Leftover sidecar images from disk (preserve everything in the folder)
	if (cfg.archiveLeftovers !== false) {
		const assetRoot = path.join(ROOT, "public/talks", cfg.assetDir);
		if (fs.existsSync(assetRoot)) {
			const onDisk = [];
			const walk = (dir, prefix = "") => {
				for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
					if (ent.name.startsWith(".")) continue;
					const rel = prefix ? `${prefix}/${ent.name}` : ent.name;
					if (ent.isDirectory()) {
						if (ent.name === "code") continue;
						walk(path.join(dir, ent.name), rel);
					} else if (/\.(png|jpe?g|gif|webp|svg)$/i.test(ent.name)) {
						onDisk.push(rel);
					}
				}
			};
			walk(assetRoot);
			const leftover = onDisk.filter((f) => !used.has(f));
			if (leftover.length) {
				slides.push(`::slide[gallery ${accent}]

_ARCHIVE_

## Additional images

${imagesMarkdown(leftover, cfg.assetDir)}
`);
			}
		}
	}

	if (cfg.slug === "restful-introduction") {
		slides.push(`::slide[lead ${accent}]

_WORKSHOP_

## Companion code

Hands-on lesson files from the original talk repo are archived at \`/talks/restful-introduction/code/\`.
`);
	}

	const frontmatter = `---
title: ${JSON.stringify(talkTitle).slice(1, -1)}
series: ${cfg.series}
description: ${JSON.stringify(cfg.description).slice(1, -1)}
minutes: ${cfg.minutes}
date: "${cfg.date}"
idx: ${cfg.idx}
ghost: ${cfg.ghost}
variant: ${cfg.variant}
---

<!--
  Archived from https://github.com/jermbo/Talks
  Source: ${cfg.source}
  Converted faithfully — wording preserved; images interleaved from the talk folder.
-->
`;

	return frontmatter + "\n" + slides.join("\n");
}

fs.mkdirSync(OUT, { recursive: true });

for (const cfg of TALKS) {
	const outPath = path.join(OUT, `${cfg.slug}.md`);
	const md = buildTalk(cfg);
	fs.writeFileSync(outPath, md);
	console.log("wrote", path.relative(ROOT, outPath), `(${md.split("::slide").length - 1} slides)`);
}
