/**
 * Export entry — bundled by scripts/export-talk.mjs via esbuild.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";
import { loadTalk } from "../src/lib/proto/talks/load";
import { renderTalkShow } from "../src/lib/proto/talks/render-html";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "src/content/talks");
const OUT_DIR = path.join(ROOT, "exports");
const CSS_PATH = path.join(ROOT, "src/styles/talk.css");
const BOOT = path.join(ROOT, "scripts/talk-standalone-boot.ts");
const GSAP_SHIM = path.join(ROOT, "scripts/gsap-cdn-shim.js");

const DEFAULT_SLUGS = ["your-ai-has-amnesia", "skills-superpowers-for-your-flow"];

const GSAP_CDN = "https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js";
const FONTS =
	"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap";

function escapeAttr(s: string): string {
	return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

async function bundleRuntime(): Promise<string> {
	const result = await esbuild.build({
		entryPoints: [BOOT],
		bundle: true,
		write: false,
		format: "iife",
		platform: "browser",
		target: ["es2020"],
		alias: { gsap: GSAP_SHIM },
		logLevel: "silent",
	});
	return result.outputFiles[0].text;
}

function buildHtml(opts: {
	title: string;
	description: string;
	bodyHtml: string;
	css: string;
	js: string;
}): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="${escapeAttr(opts.description)}" />
<title>${escapeAttr(opts.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="${FONTS}" rel="stylesheet" />
<style>
${opts.css}
</style>
<script>document.documentElement.classList.add("js");</script>
</head>
<body>
<a class="talk-skip" href="#talk-stage">Skip to slides</a>
${opts.bodyHtml}
<script src="${GSAP_CDN}"></script>
<script>
${opts.js}
</script>
</body>
</html>
`;
}

async function exportSlug(slug: string, css: string, js: string): Promise<string> {
	const mdPath = path.join(CONTENT, `${slug}.md`);
	if (!fs.existsSync(mdPath)) {
		throw new Error(`Talk not found: ${mdPath}`);
	}
	const source = fs.readFileSync(mdPath, "utf8");
	const { meta, doc } = loadTalk(source);
	const bodyHtml = renderTalkShow(meta.title, doc, { exitLink: false });
	const html = buildHtml({
		title: `${meta.title} — ${meta.series}`,
		description: meta.description || "Talk",
		bodyHtml,
		css,
		js,
	});
	const outPath = path.join(OUT_DIR, `${slug}.html`);
	fs.writeFileSync(outPath, html, "utf8");
	return outPath;
}

const slugs = process.argv.slice(2);
const targets = slugs.length ? slugs : DEFAULT_SLUGS;

fs.mkdirSync(OUT_DIR, { recursive: true });
const css = fs.readFileSync(CSS_PATH, "utf8");
const js = await bundleRuntime();

for (const slug of targets) {
	const out = await exportSlug(slug, css, js);
	console.log(`wrote ${path.relative(ROOT, out)}`);
}
