# CLAUDE.md

Operational notes for Claude Code (and other agents) working in this repo.

## What This Repo Is

The reusable telehealth marketing and commerce **storefront kit**. A code implementation of the Lattice design system, extended with telehealth-specific archetypes, typed to consume `teligant-headless` v1.

Each customer engagement takes this kit, applies a customer-specific Lattice skin (tokens, type pairings, voice, photography, logo), configures content and archetypes, wires real headless adapters as tranches land, and deploys to customer-owned infrastructure.

The kit is **internal IP**. Customer deliverables are **bespoke websites built from the kit**. The kit is not a SaaS, not a page-builder, not a merchant-configurable storefront, not a hosted product.

## Current State (as of 2026-04-17)

**Pre-Chapter 0.** Empty scaffold. Nothing built yet. No architecture decisions locked.

**Do not write application code in this repo until the Chapter 0 decisions are made and documented.** See `docs/roadmap.md` for what Chapter 0 covers (framework, monorepo shape, styling model, customer instantiation mechanism, adapter strategy, testing strategy, governance). Starting code without those decisions produces rework.

## Relationship To Other Repos

This repo is one of three that compose Teligant's full-stack telehealth offering:

| Repo | Role | Path |
|------|------|------|
| `teligant-headless` | Regulated backend. API, admin, intake, provider review. | `/Users/kellysmith/Projects/teligant-headless` |
| `teligant-headless-storefront` | **This repo.** Reusable frontend kit. | `/Users/kellysmith/Projects/teligant-headless-storefront` |
| `lattice-design-system` | Governed design language. Canonical specs. | `/Users/kellysmith/Projects/lattice-design-system` |

This repo **consumes** `teligant-headless` through typed adapters (real for shipped tranches, typed mocks for un-shipped tranches).

This repo **implements** Lattice. The Lattice docs are the authority on design decisions; this repo is the code that expresses them.

This repo **produces** customer-owned websites per engagement. Each customer website is a separate artifact outside this repo.

## Governing Documents (Read Before Building)

Read in this order:

1. `README.md` — what this repo is, at a glance.
2. `docs/roadmap.md` — the attack plan. Four parts, twelve chapters.
3. `teligant-headless/docs/product-vision/telehealth-storefront-delivery-ambition.md` — strategic positioning.
4. `teligant-headless/docs/product-vision/customer-storefront-delivery-model.md` — operational delivery model (ownership, phases, stop conditions).
5. `teligant-headless/docs/process/systems-approach.md` — workflow governance. Every engagement and every kit change operates under this.
6. `teligant-headless/docs/design-system/AGENT.md` — Lattice design authority (mirror).
7. `teligant-headless/docs/design-system/README.md` and `SYSTEM-MAP.md` — Lattice structure and reading order.

If any instruction in this file conflicts with those authority documents, the authority documents win.

## Authority Model

Nothing gets built in this repo without:

1. A documented decision for the thing being built (Chapter 0 for foundational architecture; per-chapter decision notes for chapter-level scope).
2. The change operating under `systems-approach.md` discipline — named archetype, pulled-from-ladder values, migration doc if structural.

If a request would require deciding product or design behavior (framework choice, new archetype, new token tier, new adapter contract, styling model), **stop and ask**. Do not infer. This is not a repo where default-good-taste is the final arbiter; Lattice and the roadmap are.

## Hard Rules (Pre-Emptive)

These apply the moment code starts landing. Listed here so they're not surprises later.

### Design System Discipline

- **Do not invent local tokens when a Lattice token exists.** If a token needs to be added, propose it against Lattice first, do not add it locally.
- **Do not bypass Lattice archetypes for new surfaces.** Every surface names the archetype it instantiates. If no archetype fits, propose a new one per Lattice's §8 creation rule.
- **Do not fork Lattice.** If the kit needs something Lattice does not express (e.g., telehealth-specific archetypes), extend by inheritance, not by parallel invention.
- **Do not style components from primitive color tokens when semantic tokens exist.**

### Headless Adapter Discipline

- **Do not call `teligant-headless` directly.** All calls go through typed adapters in this kit.
- **Do not ship a surface that depends on an un-shipped headless tranche without a typed mock adapter.** Un-tranched surfaces use mock adapters that match the intended v1 contract.
- **Do not fork the headless contract.** Adapter types reflect the intended headless v1 shape; contract changes feed back to `teligant-headless` tranche planning.

### Customer Engagement Discipline

- **Do not bake customer-specific logic into the kit.** Customer skins, content, and configuration are per-engagement; kit code is customer-neutral.
- **Do not ship a customer-specific archetype unless it's been promoted to the kit.** Per-customer invention that should have been general is a delivery defect.
- **Do not delete customer content or configuration during kit refactors.** Customer engagements are downstream consumers; backward-compatibility discipline applies.

### Dependency Hygiene

- **Do not introduce heavy client dependencies without a documented reason.** The kit is performance-sensitive — customer websites will be judged on Core Web Vitals.
- **Do not introduce server-rendered dependencies that prevent static export** until Chapter 0 decides whether the kit is SSR-only, SSG-capable, or hybrid.
- **Lockfile discipline applies from day one.** Once a lockfile lands, do not delete it. Targeted updates only.

## What To Do Before Chapter 0 Is Locked

Exactly these things. Nothing more.

- Read the roadmap (`docs/roadmap.md`).
- Read the governing documents listed above.
- Propose Chapter 0 decisions in a dedicated doc (`docs/chapter-0-architecture-decisions.md` when authored) for review.
- Do not scaffold `package.json`, `tsconfig`, framework config, or any code. Chapter 0 decides the stack.
- Do not copy Lattice tokens into this repo as code. The mirror lives in `teligant-headless/docs/design-system/`. Lattice-as-code is Chapter 2.

## Commands (None Yet)

This repo has no build, test, lint, or dev commands. That's Chapter 1 work. This section will be populated as the kit scaffolds.

## Git Discipline

- **Default branch:** `main`.
- **No remote yet.** Remote configuration is a Chapter 1 decision.
- **Documentation-only changes** (`README.md`, `CLAUDE.md`, `docs/**`) may commit directly to `main` during this pre-Chapter-0 phase.
- **Code changes** (once they exist): land on `feat/*` branches, merge via PR. Same DNA as `teligant-headless`.
- Do not commit `.env*` files.
- Do not commit secrets, customer data, or customer-specific branding assets.

## Memory Posture

If persistent memory is configured for this repo, store only:
- durable stack decisions (e.g., "the styling model is X" once Chapter 0 decides)
- locked contract items
- recurring incidents or gotchas

Do not store ephemeral task state, roadmap status (roadmap doc is canonical), or anything derivable from the code once code exists.

## Defaults When A Decision Is Not Documented

- Prefer the smallest coherent change.
- Prefer explicit contracts at boundaries (typed adapters, typed props).
- Prefer Lattice-native expression over custom invention.
- Prefer deferring a feature over a placeholder that implies unfinished semantics.
- If a change would commit the repo to a stack decision not yet documented, **stop** and surface the decision that needs making.
