/**
 * Render a TalkDoc to HTML strings matching the Astro talk components.
 * Used by the standalone export (no Astro runtime).
 */
import {
	pickAccent,
	pickMotion,
	slideKind,
	layoutClass,
	type TalkAccent,
	type TalkBlock,
	type TalkDoc,
	type TalkSlide,
} from "./ast";

function esc(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function stepWrap(inner: string, on: boolean, motion: string | null): string {
	if (!on) return inner;
	const m = motion ?? "fade";
	return `<div class="talk-step" data-step data-motion="${esc(m)}">${inner}</div>`;
}

function renderCard(block: TalkBlock, accent: TalkAccent): string {
	const cardAccent = block.accent ?? accent;
	return `<article class="talk-card" data-molecule="card"><div class="talk-card__inner" data-accent="${cardAccent}"><h3>${esc(block.label ?? "")}</h3><p>${esc(block.body ?? "")}</p></div></article>`;
}

function renderLetter(block: TalkBlock): string {
	const char = block.letter ?? block.label ?? "";
	return `<div class="letter-card" data-molecule="letter"><span class="letter-card__char">${esc(char)}</span><span class="letter-card__label">${esc(block.body ?? "")}</span></div>`;
}

function renderRecapCard(block: TalkBlock, accent: TalkAccent): string {
	const cardAccent = block.accent ?? accent;
	return `<article class="recap-card" data-accent="${cardAccent}" data-molecule="recap-card"><h3>${esc(block.label ?? "")}</h3><p>${esc(block.body ?? "")}</p></article>`;
}

function renderCol(block: TalkBlock, accent: TalkAccent): string {
	const colAccent = block.accent ?? accent;
	return `<div class="talk-col accent-${colAccent}" data-molecule="col">${block.html ?? ""}</div>`;
}

function renderPills(block: TalkBlock): string {
	return `<div class="break-pills" data-molecule="pills">${block.html ?? ""}</div>`;
}

function renderCallout(block: TalkBlock): string {
	const kinds = ["important", "note", "warn"] as const;
	const kind = block.attrs.find((a) => (kinds as readonly string[]).includes(a)) ?? "note";
	return `<aside class="talk-callout talk-callout--${kind}" data-molecule="callout">${block.html ?? ""}</aside>`;
}

function renderProse(html: string): string {
	return `<div class="talk-prose">${html}</div>`;
}

function renderStepItems(
	items: TalkBlock[],
	accent: TalkAccent,
	className: string,
	molecule: string,
): string {
	const kids = items
		.map((child) =>
			stepWrap(
				renderBlock({ ...child, step: false }, accent),
				!!child.step,
				pickMotion(child.attrs),
			),
		)
		.join("");
	return `<div class="${className}" data-molecule="${molecule}">${kids}</div>`;
}

function renderBlock(block: TalkBlock, accent: TalkAccent): string {
	const motion = pickMotion(block.attrs);
	const wrap = !!block.step;
	const inner = { ...block, step: false };
	const molecule = inner.molecule;
	const children = inner.children ?? [];

	let body = "";
	if (molecule === "group") {
		body = children.map((c) => renderBlock(c, accent)).join("");
	} else if (molecule === "cards") {
		const row = inner.attrs.includes("row");
		const className = row ? "talk-cards talk-cards--row" : "talk-cards talk-cards--stack";
		body = renderStepItems(children, accent, className, "cards");
	} else if (molecule === "card") {
		body = renderCard(inner, accent);
	} else if (molecule === "letters") {
		body = renderStepItems(children, accent, "layout-letters__row", "letters");
	} else if (molecule === "letter") {
		body = renderLetter(inner);
	} else if (molecule === "col") {
		body = renderCol(inner, accent);
	} else if (molecule === "recap") {
		body = renderStepItems(children, accent, "recap-row", "recap");
	} else if (molecule === "recap-card") {
		body = renderRecapCard(inner, accent);
	} else if (molecule === "pills") {
		body = renderPills(inner);
	} else if (molecule === "callout") {
		body = renderCallout(inner);
	} else if (inner.html) {
		body = renderProse(inner.html);
	} else {
		body = children.map((c) => renderBlock(c, accent)).join("");
	}

	return stepWrap(body, wrap, motion);
}

function renderSlide(slide: TalkSlide, index: number): string {
	const kind = slideKind(slide.attrs);
	const accent = pickAccent(slide.attrs);
	const isBreak = kind === "break" || kind === "cta";
	const fill = isBreak ? ` data-fill="${accent}"` : "";
	const hidden = index === 0 ? "false" : "true";
	const mark = isBreak ? `<span class="break-mark" aria-hidden="true"></span>` : "";
	const blocks = slide.blocks.map((b) => renderBlock(b, accent)).join("");

	return `<section class="talk__slide ${layoutClass(kind)}" data-slide data-kind="${kind}" data-accent="${accent}"${fill} aria-hidden="${hidden}">${mark}${blocks}</section>`;
}

export function renderTalkShow(title: string, doc: TalkDoc, opts: { exitLink?: boolean } = {}): string {
	const total = doc.slides.length;
	const slides = doc.slides.map((s, i) => renderSlide(s, i)).join("");
	const brand = opts.exitLink
		? `<a class="talk__brand" href="/proto/hub/option-6">Exit · Hub</a>`
		: "";

	return `<div class="talk" id="talk-stage" data-talk data-accent="purple" tabindex="0" role="region" aria-roledescription="carousel" aria-label="${esc(title)}. Arrow keys advance reveals, then slides.">
	<div class="talk__stage">${slides}</div>
	<div class="talk__chrome" data-no-advance>
		<div class="talk__top">
			${brand}
			<span class="talk__counter" data-counter>01 / ${String(total).padStart(2, "0")}</span>
		</div>
		<div></div>
		<div class="talk__bottom">
			<div class="talk__nav">
				<button type="button" data-prev aria-label="Previous">Prev</button>
				<button type="button" data-next aria-label="Next">Next</button>
			</div>
			<span class="talk__hint">← → · Space · reveals then slides</span>
		</div>
	</div>
	<div class="talk__progress" data-progress aria-hidden="true"><i></i></div>
	<div class="talk__status" data-status role="status" aria-live="polite"></div>
</div>`;
}
