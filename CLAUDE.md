# CLAUDE.md

Operational notes for Claude Code and other agents working in this repo.

## What This Repo Is

`teligant-horizon` is the storefront code foundation for intelligent custom telehealth storefronts.

It is the reusable starting point Teligant uses when a customer wants a customer-owned storefront that already understands the Teligant Headless v1 boundary. It should feel conceptually similar to a modern theme foundation: a governed base with reusable layouts, sections, tokens, content patterns, and integration adapters that let a team begin a bespoke customer build with a running head start instead of a blank app.

The output of this repo is not one universal hosted storefront. The output is a repeatable foundation for customer-owned sites:

- customer-owned domain
- customer-owned deployment
- customer-owned brand, content, pricing presentation, and conversion surface
- Teligant-owned regulated workflow behind the API seam

This repo is internal IP. Customer deliverables are bespoke storefront projects derived from this foundation.

## Current State

This repo is being reset from an earlier commerce-platform investigation into the storefront foundation for Teligant's custom storefront delivery model.

Do not assume any old commerce-backend direction still applies. The storefront should integrate directly with `teligant-headless` through typed adapters and keep customer-owned commerce / checkout responsibilities on the customer side of the seam unless a specific customer project is separately authorized for a different posture.

## Where To Find Current State

This file is an operational rulebook, not a status ledger. For the current state of decisions, scope, and in-flight work — read these instead:

- `docs/chapter-0-architecture-decisions.md` — Chapter 0 decision registry. Only entries marked `DECIDED` are implementation authority. `RECOMMENDED` is direction. `PENDING` blocks dependent code. `SUPERSEDED` must not be revived without a new decision.
- `docs/chapter-0-lock-in-recommendations.md` — current CTO-office recommendation memo for the open Chapter 0 entries. Not authority on its own; becomes authority only when copied into the registry as `DECIDED`.
- `docs/roadmap.md` — chapter-by-chapter planning artifact. Not implementation authority; if it disagrees with a Chapter 0 entry, the Chapter 0 entry wins.
- `git log` / `git status` — authoritative for what is on `main` and what is in-flight.

If specific dates, commit SHAs, or "as of" anchors appear in this file, treat them as stale — that content belongs in the registry, the roadmap, or git history, not here.

## Relationship To Other Repos

| Repo | Role | Path |
|------|------|------|
| `teligant-headless` | Regulated backend: API, intake, care request workflow, webhooks, admin/provider operations, audit, tenant isolation. | `/Users/kellysmith/Projects/teligant-headless` |
| `teligant-horizon` | This repo: storefront code foundation for customer-owned custom storefronts. | `/Users/kellysmith/Projects/teligant-horizon` |
| `lattice-design-system` | Governed design language and token/archetype authority. | `/Users/kellysmith/Projects/lattice-design-system` |

This repo consumes `teligant-headless` through typed adapters. Real adapters are used for shipped backend surfaces; mock adapters may stand in for planned backend surfaces when the mock exactly reflects the intended v1 contract.

This repo implements Lattice. Lattice is the design authority. This repo expresses Lattice in code and adds telehealth-specific storefront archetypes when they are reusable across customers.

## Governing Documents

Read in this order:

1. `README.md` — project orientation.
2. `AGENTS.md` — agent-facing product boundary and repo rules.
3. `docs/roadmap.md` — roadmap for turning the foundation into a working custom storefront starter.
4. `docs/chapter-0-architecture-decisions.md` — foundational architecture decisions.
5. `/Users/kellysmith/Projects/teligant-headless/docs/explainers/two-integration-scenarios.md` — storefront delivery model explainer.
6. `/Users/kellysmith/Projects/teligant-headless/AGENTS.md` — regulated backend product boundary.
7. `/Users/kellysmith/Projects/teligant-headless/docs/product/product-contract.md` — Headless v1 product contract.
8. `/Users/kellysmith/Projects/teligant-headless/docs/product/commerce-orchestration-authority.md` — commerce posture and payment-state authority.
9. `/Users/kellysmith/Projects/teligant-headless/docs/product/status/status.yaml` — current backend tranche status.

If this file conflicts with `AGENTS.md` in this repo, `AGENTS.md` wins. If either conflicts with the Teligant Headless authority stack, the Headless authority stack wins.

## Authority Model

Nothing gets built in this repo unless the change preserves these boundaries:

1. Customer storefronts own marketing, layout, brand, content, product presentation, customer-side checkout UX, analytics, and deployment.
2. Teligant Headless owns regulated workflow: catalog authority, intake, care requests, patient handoff into hosted intake / portal surfaces, provider review, status contracts, webhooks, audit, and admin/provider operations.
3. The seam between this repo and `teligant-headless` is typed, tenant-bound, and capability-aware.
4. Lattice owns design-system decisions. This repo does not invent parallel tokens, typography, spacing, color semantics, or archetype rules.

If a request requires deciding product behavior, schema shape, patient auth posture, payment semantics, PHI handling, tenant isolation, or Lattice design authority, stop and surface the required decision instead of inferring it locally.

## Hard Rules

`AGENTS.md` is the authority on storefront boundary, adapter discipline, Lattice discipline, customer-instantiation discipline, and commerce posture. Read `AGENTS.md` § Non-Negotiable Rules first. Do not duplicate those rules here — when they drift, the duplicated copy is the one that goes wrong. If this file conflicts with `AGENTS.md`, `AGENTS.md` wins.

The rules below are operational hygiene that does not live in `AGENTS.md` — repo mechanics that an agent will hit before any product-boundary question comes up.

### Lockfile And Dependencies

- Once `package-lock.json` exists, do not delete it. Lockfile churn breaks reproducible installs.
- Do not delete `node_modules/` unless the lockfile is present and intact. If dependency recovery is needed, verify the lockfile first, then reinstall from it.
- Do not add heavy client dependencies without a documented reason.
- Do not add dependencies that make customer storefronts harder to deploy unless Chapter 0 authorizes the tradeoff.

### Secrets And Sensitive Data

- Never print secrets in logs, errors, test output, docs, or commits.
- Do not commit `.env*` files, API keys, tenant credentials, customer data, patient data, or real customer brand assets.
- Keep server-only adapter credentials out of browser bundles. (This is repeated from `AGENTS.md` because the failure mode is silent and severe.)

### Known Unknowns

The following non-negotiables in `AGENTS.md` are not currently enforced by tooling — no scaffold, no lint, no CI, no test layer. They depend entirely on author + reviewer discipline until Chapter 1 lands enforcement:

- adapter discipline (no direct `teligant-headless` calls from components, no contract drift)
- mock-adapter labeling
- Lattice token discipline (no raw values, no parallel design system)
- customer-instantiation discipline (no customer-specific logic in foundation packages)

When scaffold lands, enforcement should land with it. Until then, treat these as load-bearing reviewer obligations.

## Commands

**There are no working commands yet.** This repo has no `package.json`, no lockfile, and no scaffold. Do not invent or run npm scripts. Chapter 1 (Scaffold + Charter) will land the first real commands.

When the scaffold lands, replace this section with the smallest useful set of commands that actually work, under the header "Commands that actually work" — and keep it current. Until then, this section exists to prevent agents from running commands that will fail.

Anticipated post-scaffold shape (for reference only — these do not exist yet and must not be run):

- install, dev, build, type-check, lint, test
- per-workspace variants once the monorepo lands

## Gotchas Learned The Hard Way

No incidents recorded yet — this repo is in foundation reset and has not accumulated operational scar tissue.

When something burns a session (a wrong tool call, a silent failure, a non-obvious config trap, a git mistake), record it here in one or two lines. Be specific: name the file, the command, or the symptom. The Headless `CLAUDE.md` builds reliability this way; this section exists so Horizon can do the same intentionally rather than accidentally.

## Git Discipline

- Default branch: `main`.
- Documentation-only changes may land directly while the repo is in foundation reset.
- Code changes should use focused branches once the scaffold exists.
- Do not clean up unrelated files.
- Do not delete or rewrite downstream customer artifacts from this repo.

## Defaults When A Decision Is Not Documented

- Prefer the smallest coherent change.
- Prefer explicit contracts at boundaries.
- Prefer Lattice-native expression over local invention.
- Prefer mock-adapter-first for planned backend capabilities.
- Prefer customer-owned storefront responsibility over Teligant-owned storefront scope.
- If a change would commit the repo to an undocumented stack or product decision, stop and surface the missing decision.
