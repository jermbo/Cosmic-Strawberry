---
title: Architecting Your Front End
series: TALK 101
description: A solid foundation for HTML and CSS that stays flexible, maintainable, and extensible.
minutes: 35
date: "2018.06"
idx: T03
ghost: Architect
variant: stack
---

<!--
  Authoring reference: docs/talks.md
  Source: https://github.com/jermbo/Talks/tree/main/ArchitectingYourFrontEnd
-->

::slide[title fade orange]

_TALK 101_

# Architecting Your Front End

A solid foundation for HTML and CSS — flexible, maintainable, and extensible.

::slide[lead orange]

_01 — THE SITUATION_

## We start with the best intentions

This project is going to be clean, maintainable, expandable — the work of art other art is modeled after.

Then the project changes. Client requests push past what was anticipated. Business requirements shift. Rework shows up that never lived in the original design.

::::step[reveal-bottom]
You are left with the question: rewrite from scratch, or bolt onto what already exists?
::::

::slide[lead orange]

_01 — THE SITUATION_

## Afraid of the CSS file

In every project there comes a point when the stylesheet turns into an unmaintainable heap — and everyone is afraid to touch it in fear of the whole house of cards crumbling.

:::callout[important reveal-bottom]
This talk is a set of tactics to keep things as pristine as possible.
:::

::slide[break lavender]

_THE QUESTION_

# How do I create a solid foundation?

::slide[split lavender]

_02 — THE QUESTION_

## Flexible. Maintainable. Extensible.

:::cards[stack step reveal-bottom]

- **Short answer** — It's tough. There is no magic bullet for every project, every time.
- **Longer answer** — Even so, there are practices that guide a project down a good path.
  :::

::slide[split orange]

_02 — THE QUESTION_

## Guidelines I start with

:::cards[stack step reveal-bottom]

- **Look at the designs** — Reused vs unique. How the design system becomes code.
- **Understand specificity** — It decides what actually wins.
- **Adopt a naming convention** — I like BEM, with a twist.
- **Pick a preprocessor** — Variables, mixins, maps, loops.
- **Intentional vs accidental** — Similarities that look the same but aren't.
  :::

::slide[break orange]

_SPECIFICITY_

# What the browser actually applies

::slide[split orange]

_03 — SPECIFICITY_

## Least to most specific

:::cards[stack step reveal-bottom]

- **Type + pseudo-elements** — `div` · `h1` · `::before`
- **Class, attribute, pseudo-class** — `.card` · `[type='text']` · `:hover`
- **ID selectors** — `#footer` · `#main-content`
- **Inline styles** — `style="color: red"`
- **!important** — Pronounced "bang important"
  :::

:::callout[note reveal-bottom]
Tool: [Specificity Calculator](https://specificity.keegan.st/) by Keegan.
:::

::slide[gallery orange]

_03 — SPECIFICITY_

## Visualizing the ladder

![Specificity type selectors](/talks/architecting-your-front-end/specificity-01.jpg)

![Specificity class selectors](/talks/architecting-your-front-end/specificity-02.jpg)

![Specificity ID selectors](/talks/architecting-your-front-end/specificity-03.jpg)

![Specificity inline and important](/talks/architecting-your-front-end/specificity-04.jpg)

::slide[split orange]

_03 — SPECIFICITY_

## Rules I enforce aggressively

:::cards[stack step reveal-bottom]

- **Never overqualify** — Don't stack type + class when a class is enough.
- **Never style IDs** — Keep the ceiling low.
- **Stay flat** — Never more than three selectors deep. Give it a class instead.
- **Inline is for generated code** — JS animation, or a data-driven background image.
- **!important sparingly** — Question why you need it before you use it.
  :::

::slide[break lime]

_PREPROCESSORS_

# Sass is a tool — not a free pass

::slide[split lime]

_04 — PREPROCESSORS_

## Features I reach for most

:::cards[row step reveal-bottom]

- **Nesting**
- **Variables**
- **Mixins**
- **Includes**
- **Lists**
- **Loops**
- **Interpolation**
  :::

::slide[lead lime]

_04 — PREPROCESSORS_

## Nesting: predict the output

Nesting is powerful and easy to abuse. If I can read the Sass and foresee the CSS — and it stays within the specificity rules — nesting is fine.

:::callout[warn reveal-bottom]
Keep it shallow. If the output is more than three selectors deep, rethink it.
:::

::slide[gallery lime]

_04 — PREPROCESSORS_

## Proper nesting

![Nesting good SCSS](/talks/architecting-your-front-end/Nesting-SCSS-Good.png)

![Nesting good CSS](/talks/architecting-your-front-end/Nesting-CSS-Good.png)

::slide[gallery lime]

_04 — PREPROCESSORS_

## Bad nesting

![Nesting bad SCSS](/talks/architecting-your-front-end/Nesting-SCSS-Bad.png)

![Nesting bad CSS](/talks/architecting-your-front-end/Nesting-CSS-Bad.png)

::slide[gallery lime]

_04 — PREPROCESSORS_

## Variables enforce consistency

Meaningful names for color, type, and space keep design decisions the same across the site.

![Preprocessor variables](/talks/architecting-your-front-end/variables.png)

![Preprocessor variables output](/talks/architecting-your-front-end/variables-output.png)

::::step[fade]
CSS custom properties win when browsers support them and you will use the JS hook. Otherwise Sass variables still earn their keep.
::::

::slide[gallery lime]

_04 — PREPROCESSORS_

## Mixins and includes

One place of truth for broader design decisions — shared shadow, shared hover transition — included where it belongs.

![Mixins and includes](/talks/architecting-your-front-end/mixing-include.png)

![Mixins and includes output](/talks/architecting-your-front-end/mixing-include-output.png)

::slide[gallery lime]

_04 — PREPROCESSORS_

## Loops, lists, and interpolation

UI that is almost the same — icon, color, badge — without a brand-new CSS block each time.

![List loops](/talks/architecting-your-front-end/list-loops.png)

![List loops output](/talks/architecting-your-front-end/list-loops-output.png)

::slide[lead lime]

_04 — PREPROCESSORS_

## Skip `@extend`

Unpredictable output. Unintended grouping. Prefer `@include` every time.

:::callout[note reveal-bottom]
Yes, includes make the CSS a little heavier. Your site is not slow because of CSS — and gzip likes repetition.
:::

::slide[break purple]

_NAMING_

# BEM — with a twist

::slide[split purple]

_05 — NAMING_

## Why BEM stuck

:::cards[stack step reveal-bottom]

- **Easy** — You only need the naming convention.
- **Modular** — Independent blocks stay reusable.
- **Flexible** — Low specificity, easy to recompose.
  :::

:::callout[note reveal-bottom]
“BEM — Block Element Modifier helps you create reusable components and share front-end code.” — [getbem.com](http://getbem.com/)
:::

::slide[gallery purple]

_05 — NAMING_

## Standard BEM

![BEM standard HTML](/talks/architecting-your-front-end/BEM-Standard-HTML.png)

![BEM standard SCSS](/talks/architecting-your-front-end/BEM-Standard-SCSS.png)

![BEM standard CSS](/talks/architecting-your-front-end/BEM-Standard-CSS.png)

::slide[gallery purple]

_05 — NAMING_

## Standard modifiers

![BEM modifier HTML](/talks/architecting-your-front-end/BEM-Standard-Modifier-HTML.png)

![BEM modifier SCSS](/talks/architecting-your-front-end/BEM-Standard-Modifier-SCSS.png)

![BEM modifier CSS](/talks/architecting-your-front-end/BEM-Standard-Modifier-CSS.png)

::slide[split purple]

_05 — NAMING_

## Two complaints

:::cards[stack step reveal-bottom]

- **HTML bloat** — Class names pile up on every node.
- **Modifier cascade** — A parent modifier forces child modifiers too.
  :::

::::step[reveal-bottom]
Twist: children should know which parent they live in, and update from that. Modifier on the parent. Single dash. Don't repeat the parent name in the modifier.
::::

::slide[gallery purple]

_05 — NAMING_

## Modified BEM

![Modified BEM HTML](/talks/architecting-your-front-end/BEM-Modified-HTML.png)

![Modified BEM SCSS](/talks/architecting-your-front-end/BEM-Modified-SCSS.png)

![Modified BEM CSS](/talks/architecting-your-front-end/BEM-Modified-CSS.png)

::slide[break orange]

_EXAMPLE TIME_

# Look at the design first

::slide[split orange]

_06 — EXAMPLE TIME_

## Questions before a single selector

:::cards[stack step reveal-bottom]

- **Major sections** — What are the page regions?
- **Reused components** — Buttons, forms, type scale, icons.
- **Variations** — Featured vs article. Callout vs inverted.
- **Variables** — Padding, title sizes, primary color.
- **File breakdown** — One entry point, partials with jobs.
  :::

::slide[figure orange]

_06 — BROCHURE SITE_

## Design walkthrough

Design by Shekh Al Raihan — [Dribbble shot](https://dribbble.com/shots/2643400-App-Landing-Page-Design)

![Brochure website design](/talks/architecting-your-front-end/brochure-site/brochureWebSite-01.jpg)

::slide[gallery orange]

_06 — BROCHURE SITE_

## Hero — sections, headings, content

![Hero sections](/talks/architecting-your-front-end/brochure-site/brochureWebSite-01-sections.jpg)

![Hero headings](/talks/architecting-your-front-end/brochure-site/brochureWebSite-01-headings.jpg)

![Hero content block](/talks/architecting-your-front-end/brochure-site/brochureWebSite-01-content-block.jpg)

::slide[gallery orange]

_06 — BROCHURE SITE_

## Mid page — sections, headings, cards

![Mid sections](/talks/architecting-your-front-end/brochure-site/brochureWebSite-02-sections.jpg)

![Mid headings](/talks/architecting-your-front-end/brochure-site/brochureWebSite-02-headings.jpg)

![Mid info cards](/talks/architecting-your-front-end/brochure-site/brochureWebSite-02-infocards.jpg)

::slide[gallery orange]

_06 — BROCHURE SITE_

## Lower page — icons and cards

![Lower sections](/talks/architecting-your-front-end/brochure-site/brochureWebSite-03-sections.jpg)

![Lower headings](/talks/architecting-your-front-end/brochure-site/brochureWebSite-03-headings.jpg)

![Lower icons](/talks/architecting-your-front-end/brochure-site/brochureWebSite-03-icons.jpg)

![Lower info cards](/talks/architecting-your-front-end/brochure-site/brochureWebSite-03-infocards.jpg)

::slide[split orange]

_06 — BROCHURE SITE_

## File breakdown

One entry point. Partials with a single job.

:::cards[stack step reveal-bottom]

- **styles.scss** — Imports everything
- **_vars · _helpers · _base** — Tokens and foundations
- **_sections · _section-heading** — Page regions
- **_content-blocks · _info-blocks · _icons** — Components
  :::

:::callout[note reveal-bottom]
Live CodePen: [Architecting your Front End — Brochure](https://codepen.io/jermbo/project/editor/ArMmkn)
:::

::slide[gallery orange]

_06 — BROCHURE SITE_

## Sections as modifiers

![Section default](/talks/architecting-your-front-end/brochure-code/01-section.png)

![Section muted](/talks/architecting-your-front-end/brochure-code/02-section-muted.png)

![Section colored](/talks/architecting-your-front-end/brochure-code/03-section-colored.png)

::slide[gallery orange]

_06 — BROCHURE SITE_

## Section SCSS → CSS

![Section SCSS](/talks/architecting-your-front-end/brochure-code/04-section-scss.png)

![Section CSS](/talks/architecting-your-front-end/brochure-code/05-section-css.png)

::slide[gallery orange]

_06 — BROCHURE SITE_

## Section headings

![Heading default](/talks/architecting-your-front-end/brochure-code/06-section-heading.png)

![Heading stacked](/talks/architecting-your-front-end/brochure-code/07-section-heading-stacked.png)

![Heading stacked large](/talks/architecting-your-front-end/brochure-code/08-section-heading-stacked-large.png)

::slide[gallery orange]

_06 — BROCHURE SITE_

## Heading SCSS

![Heading SCSS](/talks/architecting-your-front-end/brochure-code/09-section-heading-scss.png)

![Heading SCSS continued](/talks/architecting-your-front-end/brochure-code/10-section-heading-scss.png)

::slide[gallery orange]

_06 — BROCHURE SITE_

## Content blocks

![Content block](/talks/architecting-your-front-end/brochure-code/11-content-block.png)

![Content block flip](/talks/architecting-your-front-end/brochure-code/12-content-block-flip.png)

![Content block SCSS](/talks/architecting-your-front-end/brochure-code/13-content-block-scss.png)

![Content block SCSS continued](/talks/architecting-your-front-end/brochure-code/14-content-block-scss.png)

::slide[break purple]

_WEB APP_

# Same tactics. Different surface.

::slide[figure purple]

_07 — WEB APP_

## Campaign Monitor

![Campaign Monitor UI](/talks/architecting-your-front-end/web-app/01-campaign_monitor.jpg)

::slide[gallery purple]

_07 — WEB APP_

## Annotating the UI

![Sections](/talks/architecting-your-front-end/web-app/02-campaign_monitor-sections.jpg)

![Headings](/talks/architecting-your-front-end/web-app/03-campaign_monitor-headings.jpg)

![Content](/talks/architecting-your-front-end/web-app/04-campaign_monitor-content.jpg)

![Buttons](/talks/architecting-your-front-end/web-app/05-campaign_monitor-buttons.jpg)

::slide[gallery purple]

_07 — WEB APP_

## Stats and their stuff

![Stats](/talks/architecting-your-front-end/web-app/06-campaign_monitor-stats.jpg)

![Stats detail](/talks/architecting-your-front-end/web-app/07-campaign_monitor-stats-stuff.jpg)

:::callout[note reveal-bottom]
Live CodePen: [Architecting your Front End — Web Apps](https://codepen.io/jermbo/project/editor/AwGdNo)
:::

::slide[gallery purple]

_07 — WEB APP_

## Stats in code

![Stats markup](/talks/architecting-your-front-end/web-app-code/02-stats.png)

![Stats modifiers](/talks/architecting-your-front-end/web-app-code/03-stats-mods.png)

::slide[gallery purple]

_07 — WEB APP_

## Interpolation earns its keep

![Stats SCSS](/talks/architecting-your-front-end/web-app-code/04-stats-scss.png)

![Stats SCSS interpolation](/talks/architecting-your-front-end/web-app-code/05-stats-scss-interpolation.png)

::slide[recap orange]

_08 — RECAP_

## What to take home

:::recap[step reveal-bottom]

- **Look first** — Reused, unique, variables, files — before selectors
- **Stay flat** — Specificity rules beat clever nesting
- **Name with intent** — BEM (or a twist) keeps HTML and CSS honest
  :::

::slide[cta orange]

_No magic bullet. Just a better path._

# Architect the front end before the CSS file becomes the thing you're afraid of.
