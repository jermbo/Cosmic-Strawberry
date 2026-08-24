/**
 * Compile talk markdown (remark-directive fences) into a Slide AST.
 *
 *   ::slide[fade purple]          — leaf; content until next ::slide
 *   :::cards[stack step zoom-in]  — molecule; `step` = per item, motion alone = whole
 *   ::::step[motion]              — escape hatch for prose / multi-block groups
 */
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkDirective from "remark-directive";
import { toHast } from "mdast-util-to-hast";
import { toHtml } from "hast-util-to-html";
import type { Root, RootContent, Content, List, ListItem } from "mdast";
import type { TalkBlock, TalkDoc, TalkSlide, TalkAccent } from "./ast";
import { ACCENTS, MOTION_SET } from "./ast";

type DirNode = Content & {
	type: string;
	name?: string;
	children?: Content[];
	attributes?: Record<string, string | null | undefined>;
	label?: string | null;
};

const ACCENT_SET = new Set<string>(ACCENTS);

const LIST_MOLECULES: Record<string, string> = {
	letters: "letter",
	cards: "card",
	recap: "recap-card",
};

function tokenizeLabel(label: string): string[] {
	return label
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.map((t) => t.toLowerCase());
}

/** remark-directive: leaf label = text children; container = first labeled paragraph. */
function labelAndKids(node: DirNode): { attrs: string[]; kids: Content[] } {
	const fromProps: string[] = [];
	if (node.attributes) {
		for (const [k, v] of Object.entries(node.attributes)) {
			if (v === "" || v == null || v === "true") fromProps.push(k.toLowerCase());
			else fromProps.push(String(v).toLowerCase());
		}
	}

	const children = [...((node.children ?? []) as Content[])];

	if (node.type === "leafDirective" || node.type === "textDirective") {
		return { attrs: [...tokenizeLabel(children.map(textOf).join("")), ...fromProps], kids: [] };
	}

	let label = typeof node.label === "string" ? node.label : "";
	const first = children[0];
	if (
		first?.type === "paragraph" &&
		(first as { data?: { directiveLabel?: boolean } }).data?.directiveLabel
	) {
		label = textOf(first);
		children.shift();
	}
	return { attrs: [...tokenizeLabel(label), ...fromProps], kids: children };
}

function mdastToHtml(nodes: Content[]): string {
	if (!nodes.length) return "";
	const hast = toHast({ type: "root", children: nodes as RootContent[] }, { allowDangerousHtml: true });
	return hast ? toHtml(hast, { allowDangerousHtml: true }) : "";
}

function textOf(node: Content | Root): string {
	if ("value" in node && typeof node.value === "string") return node.value;
	if ("children" in node && Array.isArray(node.children)) {
		return (node.children as Content[]).map(textOf).join("");
	}
	return "";
}

function listItems(list: List): { label: string; body: string; letter?: string }[] {
	return list.children.map((item: ListItem) => {
		const raw = textOf(item).trim();
		const letter = raw.match(/^([A-Za-z])\s*[—–-]\s*(.+)$/);
		if (letter) return { letter: letter[1], label: letter[1], body: letter[2].trim() };

		const parts = raw.split(/\s*[—–]\s*/);
		if (parts.length >= 2) {
			return {
				label: parts[0].replace(/\*\*/g, "").trim(),
				body: parts.slice(1).join(" — ").trim(),
			};
		}
		return { label: "", body: raw };
	});
}

function splitReveal(attrs: string[]) {
	const motion = attrs.filter((a) => MOTION_SET.has(a));
	const perItem = attrs.includes("step");
	const layout = attrs.filter((a) => a !== "step" && !MOTION_SET.has(a));
	return {
		layout,
		motion,
		perItem,
		asStep: perItem || motion.length > 0,
	};
}

function htmlMolecule(name: string, attrs: string[], kids: Content[]): TalkBlock {
	const { layout, motion, asStep } = splitReveal(attrs);
	return {
		molecule: name,
		attrs: [...layout, ...motion],
		step: asStep,
		html: mdastToHtml(kids),
		accent: attrs.find((a) => ACCENT_SET.has(a)) as TalkAccent | undefined,
	};
}

function nodesToBlocks(nodes: Content[]): TalkBlock[] {
	const blocks: TalkBlock[] = [];
	let buf: Content[] = [];

	const flush = () => {
		if (!buf.length) return;
		const html = mdastToHtml(buf);
		buf = [];
		if (html.trim()) blocks.push({ html, attrs: [] });
	};

	for (const node of nodes) {
		const n = node as DirNode;
		const isDir =
			n.type === "containerDirective" || n.type === "leafDirective" || n.type === "textDirective";
		if (!isDir) {
			buf.push(node);
			continue;
		}

		flush();
		const name = (n.name ?? "").toLowerCase();
		const { attrs, kids } = labelAndKids(n);

		if (name === "step") {
			const inner = nodesToBlocks(kids);
			if (inner.length === 1) {
				blocks.push({ ...inner[0], step: true, attrs: [...attrs, ...inner[0].attrs] });
			} else {
				blocks.push({ step: true, attrs, children: inner, molecule: "group" });
			}
			continue;
		}

		const itemKind = LIST_MOLECULES[name];
		if (itemKind) {
			const list = kids.find((c) => c.type === "list") as List | undefined;
			if (list) {
				const { layout, motion, perItem } = splitReveal(attrs);
				const items = listItems(list).map((it, i) => ({
					molecule: itemKind,
					attrs: perItem ? motion : [],
					step: perItem,
					letter: it.letter,
					label: it.label,
					body: it.body,
					accent: name === "recap" ? (ACCENTS[i % ACCENTS.length] as TalkAccent) : undefined,
				}));
				blocks.push({
					molecule: name,
					attrs: [...layout, ...(perItem ? [] : motion)],
					children: items,
					step: !perItem && motion.length > 0,
				});
				continue;
			}
		}

		if (name === "col" || name === "callout" || name === "pills") {
			blocks.push(htmlMolecule(name, attrs, kids));
			continue;
		}

		blocks.push({ molecule: name || "unknown", attrs, html: mdastToHtml(kids) });
	}

	flush();
	return blocks;
}

export function parseTalkMarkdown(source: string): TalkDoc {
	const tree = unified().use(remarkParse).use(remarkDirective).parse(source) as Root;

	const slides: TalkSlide[] = [];
	let current: TalkSlide | null = null;
	let buf: Content[] = [];

	const pushSlide = () => {
		if (!current) return;
		current.blocks = nodesToBlocks(buf);
		slides.push(current);
		buf = [];
		current = null;
	};

	for (const node of tree.children) {
		const n = node as DirNode;
		if (n.type === "leafDirective" && n.name === "slide") {
			pushSlide();
			current = { attrs: labelAndKids(n).attrs, blocks: [] };
			continue;
		}
		if (!current) continue;
		buf.push(node as Content);
	}
	pushSlide();

	return { slides };
}
