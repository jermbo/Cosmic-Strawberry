---
title: Skills — Superpowers for Your Flow
series: TALK 202
description: Instructions + references + resources. Built once, used everywhere.
minutes: 20
date: "2026.08"
idx: T02
ghost: Skills
variant: orbit
---

<!--
  Authoring reference: docs/talks.md

  Fence rules (short):
  - ::slide[attrs]              — leaf separator (starts a slide)
  - :::molecule[attrs]          — cards, letters, col, callout, … (put step/motion here)
  - ::::step[motion]            — rare: wrap plain prose or several blocks as one reveal
  Save this file → Vite hot-reloads the talk page (?raw import).
-->

::slide[title fade lime]

_TALK 202_

# Skills: Superpowers for Your Flow

Instructions + references + resources. Built once, used everywhere.

::slide[split lime]

_01 — THE IDEA_

## What is a skill?

:::cards[stack step reveal-bottom]

- **A folder your agent reads** — When the task calls for it
- **Minimum viable** — One `SKILL.md` file
- **Optionally** — Add `references/` and `resources/` folders
- **Harness agnostic** — Not just a Claude thing
  :::

:::callout[important reveal-bottom]
Write it once. It travels with you across chats, projects, repos. No more re-explaining the same thing every session.
:::

::slide[split purple]

_01 — THE IDEA_

## Anatomy of a skill

:::cards[stack step reveal-bottom]

- **SKILL.md** — Required. The instructions — what to do, when to do it.
- **references/** — Stuff to consult. Doesn't cost context until it's needed.
- **resources/** — Scripts, templates, lookup tables.
  :::

::slide[break lavender]

_A REAL SKILL.MD_

# The frontmatter

::slide[split purple]

_02 — A REAL SKILL.MD_

## The frontmatter

:::cards[stack step reveal-bottom]

- **name** — `commit-message-enforcer`
- **description** — Use when writing a git commit message. Enforces team convention (type, scope, imperative mood) and rejects vague messages before they're committed.
  :::

::slide[split purple]

_02 — A REAL SKILL.MD_

## The instructions

:::cards[stack step reveal-bottom]

- **1** — Read the staged diff.
- **2** — Draft a message in `type(scope): summary` format.
- **3** — Reject the draft if the summary is vague ("fix stuff", "updates") — rewrite until it says what actually changed.
- **4** — Confirm with me before committing.
  :::

:::callout[important reveal-bottom]
That **description** field isn't documentation. It's the trigger. It's the only thing deciding whether this skill fires at all.
:::

::slide[matter lime]

_02 — A REAL SKILL.MD_

## Writing a trigger that fires

:::col[orange reveal-left]

### Too broad

Helps with git stuff

Could mean anything. Never fires, or fires for the wrong thing.
  :::

:::col[lime reveal-right]

### Specific

Use when writing a git commit message

Matches the moment it's needed.
  :::

::::step[fade]
Write the description as *the situation*, not the topic. If you can't picture the exact moment this should kick in, neither can the agent.
::::

::slide[break orange]

# Three different jobs

Don't mix them up.

::slide[recap orange]

_03 — THREE JOBS_

## Instructions, references, scripts

:::recap[step reveal-bottom]

- **Instructions** — The judgment calls. The "when" and the "why" — what order, what to check, when to stop and ask. If it requires thinking, it's an instruction.
- **References** — Knowledge to consult, not hold in your head. Pulled in only when needed. Costs nothing until it's relevant.
- **Scripts** — Fixed logic. Deterministic, one right answer. Reasoning through the same thing every time? It should be running code.
  :::

:::callout[note reveal-bottom]
Get this split wrong and a skill either burns tokens re-deriving things that never change, or tries to hardcode something that actually needed judgment.
:::

::slide[lead lime]

_04 — FINDING SKILLS_

## Finding the skill hiding in your day

You already know what this is. You just haven't named it yet.

:::cards[stack step reveal-bottom]

- **Re-explain** — The thing you re-explain to the agent every single time
- **Same order** — The steps you do in the same order without thinking about it
- **Judgment worn smooth** — The call you've made so many times it's not really a judgment call anymore
  :::

::::step[fade]
That's not busywork. That's a skill you haven't written down. If you can say it simply — that's the thing to capture.
::::

::slide[break lime]

_DEV EXAMPLE_

# plan-pbi / execute-pbi

Runs the whole ticket lifecycle.

::slide[split lime]

_05 — DEV EXAMPLE_

## plan-pbi / execute-pbi

:::cards[stack step reveal-bottom]

- **1** — Loads the PBI, moves it to the right swim lane
- **2** — Compares requirements against the codebase
- **3** — Asks clarifying questions, documents the answers
- **4** — Writes the code, checks for correctness
- **5** — Drafts a PR, moves the ticket again, requests review
  :::

:::callout[note reveal-bottom]
This isn't a shortcut for one step. It's the entire flow, encoded once.
:::

::slide[split purple]

_05 — DEV EXAMPLE_

## app-grill

Inspired by Matt Pocock's grill-with-docs, bent to fit my own process.

:::cards[stack step reveal-bottom]

- **Creates** — An initiative folder
- **Grills** — About requirements, explores the possibilities
- **Logs** — Every answer as a decision
- **Keeps** — A glossary updated as we go
- **Drafts** — Features and PBIs out of the conversation
  :::

:::callout[important reveal-bottom]
The interview isn't the point. The paper trail it leaves behind is.
:::

::slide[break lavender]

_OUTSIDE THE CODEBASE_

# Writing coach

Grades my writing like a high school English teacher.

::slide[split purple]

_06 — OUTSIDE THE CODEBASE_

## Writing coach

:::cards[row step reveal-bottom]

- **Point** — Is the point actually clear?
- **Voice** — Is the voice and tone consistent?
- **Grammar** — Is the grammar right?
  :::

::::step[fade]
It won't rewrite it for me. It gives feedback, I rewrite, it grades again. The job isn't to fix my writing. It's to make me better at fixing it myself.
::::

:::callout[note reveal-bottom]
Same structure as any dev skill — instructions on how to grade, references for what "good" looks like, no scripts needed. It just points somewhere other than code.
:::

::slide[split orange]

_07 — NON-DEV EXAMPLE_

## Solo run

Started as a way to learn D&D. Turned into a full toolkit — bookkeeper, campaign manager, fact checker, rule explainer, scene setter.

::::step[fade]
Hand it a PDF of a new game, and it teaches you the system by playing it with you.
::::

:::callout[important reveal-bottom]
**The split, doing real work** — The dice rolls and reference charts run as scripts, not conversation. No reason to make the model reinvent a d20 roll every time. Set it once, look it up after that. Not hypothetical — actually running every session.
:::

::slide[lead lime]

_08 — RESOURCES_

## Resources

:::cards[stack step reveal-bottom]

- **Skills docs** — code.claude.com/docs/en/skills
- **Matt Pocock's skills** — github.com/mattpocock/skills
- **Anthropic's example skills** — github.com/anthropics/skills
  :::

::slide[split lime]

_09 — HANDS-ON_

## Build a skill for something in your own repo. Now.

Pick a lane.

:::cards[row step reveal-bottom]

- **Repo hygiene** — Onboarding skill, decision record keeper, glossary builder
- **Workflow** — Ticket-to-branch, PR description drafter, changelog generator
- **Quality** — Commit message enforcer, naming convention checker, test coverage gap finder
- **Easy first skill** — Standup summary, meeting notes → action items, code review checklist walker
  :::

::slide[cta lime]

_Mine might not solve your problem. That's fine — it's not supposed to._

# Build for your own flow. That's when it actually becomes a superpower.
