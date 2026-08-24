/**
 * Tiny YAML-ish frontmatter split for talk markdown loaded via `?raw`.
 * Enough for title / series / description / minutes / date — not a full YAML parser.
 */
export function splitFrontmatter(source: string): {
	data: Record<string, string | number>;
	body: string;
} {
	const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
	if (!m) return { data: {}, body: source };

	const data: Record<string, string | number> = {};
	for (const line of m[1].split(/\r?\n/)) {
		const i = line.indexOf(":");
		if (i < 0) continue;
		const key = line.slice(0, i).trim();
		if (!key || key.startsWith("#")) continue;
		let val = line.slice(i + 1).trim();
		if (
			(val.startsWith('"') && val.endsWith('"')) ||
			(val.startsWith("'") && val.endsWith("'"))
		) {
			val = val.slice(1, -1);
		}
		data[key] = /^-?\d+(\.\d+)?$/.test(val) ? Number(val) : val;
	}

	return { data, body: m[2] };
}
