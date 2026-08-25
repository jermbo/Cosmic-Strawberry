/**
 * Export a talk markdown file as a single standalone HTML presentation.
 * Fonts + GSAP load from CDN; CSS and talk JS are inlined.
 *
 * Usage:
 *   node scripts/export-talk.mjs [slug ...]
 *
 * Defaults to: your-ai-has-amnesia skills-superpowers-for-your-flow
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENTRY = path.join(ROOT, "scripts/export-talk-entry.ts");
const TMP_DIR = path.join(ROOT, ".tmp");
const BUNDLE = path.join(TMP_DIR, "export-talk.mjs");

const require = createRequire(import.meta.url);
const esbuild = require("esbuild");

fs.mkdirSync(TMP_DIR, { recursive: true });

esbuild.buildSync({
	entryPoints: [ENTRY],
	outfile: BUNDLE,
	bundle: true,
	platform: "node",
	format: "esm",
	packages: "external",
	logLevel: "silent",
});

const result = spawnSync(process.execPath, [BUNDLE, ...process.argv.slice(2)], {
	stdio: "inherit",
	cwd: ROOT,
});

process.exit(result.status ?? 1);
