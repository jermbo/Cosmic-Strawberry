---
title: Your AI Has Amnesia
series: TALK 201
description: Writing code, docs, and tests for agents that forget everything between sessions.
minutes: 25
date: "2026.08"
---

<!--
  Authoring reference: docs/talks.md

  Fence rules (short):
  - ::slide[attrs]              — leaf separator (starts a slide)
  - :::molecule[attrs]          — cards, letters, col, callout, … (put step/motion here)
  - ::::step[motion]            — rare: wrap plain prose or several blocks as one reveal
  Save this file → Vite hot-reloads the talk page (?raw import).
-->

::slide[title fade purple]

_TALK 201_

# Your AI Has Amnesia

Writing code, docs, and tests for agents that forget everything between sessions

::slide[split purple]

_01 — YOUR AI HAS AMNESIA_

## Agents restart every conversation

Every new session starts from zero. Nothing carries over:

:::cards[stack step reveal-bottom]

- **Direction** — Where the team landed, and how
- **Options tried** — What was attempted and ruled out
- **Decisions** — What was chosen, and why
  :::

::slide[lead purple]

_01 — YOUR AI HAS AMNESIA_

## Why this matters now

Agents are doing more real work, more autonomously, more often. Forgetting used to be a minor cost. At this scale, it compounds.

:::callout[important reveal-bottom]
Amnesia is not a model flaw — it is the default. The repo has to remember for it.
:::

::slide[break lime]

_TALK 101 → TALK 201_

# The VIBES Frame

::slide[letters lime]

_02 — THE VIBES FRAME_

## Five layers, one framework

:::letters[step reveal-bottom]

- V — Vision
- I — Intent
- B — Boundary
- E — Execute
- S — Stability
  :::

::slide[lead lime]

_02 — THE VIBES FRAME_

## This talk: from framework to practice

101 introduced the frame. 201 is about what to actually do about it, day to day, across the whole thing.

::slide[break orange]

# Three Costs

::slide[split orange]

_03 — THREE COSTS_

## Three costs of forgetting

:::cards[stack step squish-in]

- **Verification** — Checking whether the agent's output is actually correct
- **Navigation** — Finding the right file, function, or doc before making a change
- **Cognitive** — Holding context, constraints, and intent in mind while working
  :::

::slide[break lime]

# The Three Ex's

:::pills

- Explanation
- Execution
- Expectation
  :::

::slide[break lavender]

_A_

# Explanation

Documentation

::slide[split purple]

_04A — EXPLANATION_

## Documentation is decision capture, not code replication

:::cards[row reveal-bottom]

- **Broad entry** — Start wide enough that anyone can walk in and orient themselves.
- **Progressive disclosure** — Reveal detail only as deep as the reader needs to go.
  :::

::slide[altitude purple]

_04A — EXPLANATION_

## Documentation answers by altitude

:::cards[stack step reveal-bottom]

- **30,000 ft** — Why — the problem solved, the need that drove it
- **15,000 ft** — What & contract — the feature, its promises, options considered, decisions made
- **5,000 ft** — How & paths — function, happy paths, unhappy paths, definition of done
- **Ground level** — Code, tests, implementation
  :::

::slide[columns purple]

_04A — EXPLANATION_

## Five rules, and why they matter for agents

:::col[purple reveal-left]

### Five rules

- One complete thought per document
- Multiple entry points
- No dead ends
- Progressive disclosure
- Clear front matter
  :::

:::col[lime reveal-right]

### Why it matters for agents

- Keeps the agent in the smart zone
- Reduces navigation cost
- Feeds verification
  :::

::slide[break lime]

_B_

# Execution

Code quality

::slide[split lime]

_04B — EXECUTION_

## Boundary clarity, hidden complexity

:::cards[stack step reveal-bottom]

- **Boundary clarity** — Your codebase has natural groupings — features, services, domains. Make those boundaries explicit in the file system. The agent navigates by structure, not by reading every file.
- **Hide complexity, expose intention** — What does this module do? That should be clear. How does it do it? That can stay hidden unless the agent needs to change it.
  :::

::slide[matter lime]

_04B — EXECUTION_

## Why it matters, and what breaks it

:::col[lime reveal-left]

### Why it matters

- Reads the boundary first, understands what it does
- Only reads internals if it needs to change something
- Fast feedback, because boundaries are stable
  :::

:::col[orange reveal-right]

### What breaks it

- Shallow modules — 10 files to understand 1 concept
- Unclear boundaries, exposed complexity, tangled dependencies
  :::

::slide[break orange]

_c_

# Expectation

Tests

::slide[split orange]

_04C — EXPECTATION_

## Tests are a specification, not just validation

THEY COMMUNICATE

:::cards[row step reveal-bottom]

- **Happy path** — What should happen when things go right
- **Unhappy path** — Errors, edge cases, invalid input
- **Boundaries** — What this module owns, and what it doesn't
  :::

::slide[matter orange]

_04C — EXPECTATION_

## Why it matters, and what breaks it

:::col[lime reveal-left]

### Why it matters

- Fast feedback on whether a change worked
- Executable documentation — behavior with no ambiguity
- Forces modularity, which aids navigation
  :::

:::col[orange reveal-right]

### What breaks it

- Tests that pass while the behavior is wrong
- Missing unhappy paths, brittle or too-granular tests
- No tests at all — zero confidence in changes
  :::

::slide[recap lime]

_05 — CLOSING_

## Recap: the three Ex's

:::recap[reveal-bottom]

- **Explanation** — Documentation as decision capture, by altitude
- **Execution** — Boundary clarity, complexity hidden, intention exposed
- **Expectation** — Tests as specification, contract, and feedback
  :::

::slide[cta lime]

_NOW, HANDS-ON_

# Document something in your own codebase

Pick a module. Write it at whatever altitude it's missing.
