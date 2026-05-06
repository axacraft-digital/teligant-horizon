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

### Storefront Boundary

- Do not build a hosted storefront builder, CMS, merchant theme editor, or page-builder.
- Do not build a generic e-commerce engine in this repo.
- Do not move regulated workflow into the storefront.
- Do not put PHI, clinical answers, provider notes, prescribing context, or audit-only data into storefront state.
- Do not let a customer storefront authenticate as a patient to regulated Teligant surfaces unless the relevant patient-access authority has been locked.

### Adapter Discipline

- Do not call `teligant-headless` directly from components. Calls go through typed adapters.
- Do not fork backend contracts in storefront code. Adapter types reflect the current or explicitly planned Headless v1 API contract.
- Do not ship a surface that depends on an unshipped backend capability without a mock adapter that matches the intended contract and labels the capability as planned.
- Keep API keys and tenant credentials server-side. Never expose secrets in browser bundles.

### Lattice Discipline

- Do not invent local tokens when a Lattice token exists.
- Do not bypass Lattice archetypes for new reusable sections.
- Do not fork Lattice. Telehealth-specific archetypes extend the design system; they do not create a parallel design system.
- Do not style from primitive colors when semantic tokens exist.

### Customer Instantiation Discipline

- Do not bake customer-specific logic into the foundation.
- Customer skins, content, imagery, copy, routing choices, and deployment config belong in customer projects or clearly isolated examples.
- Promote reusable patterns back into the foundation only when they are customer-neutral.
- Preserve a clean upgrade path from the foundation to downstream customer storefronts.

### Dependency Hygiene

- Do not add heavy client dependencies without a documented reason.
- Do not add dependencies that make customer storefronts harder to deploy unless Chapter 0 authorizes the tradeoff.
- Once a lockfile exists, do not delete it.
- Do not commit secrets, `.env*` files, customer data, patient data, or real customer brand assets unless explicitly authorized and non-sensitive.

## Commands

This repo may not have build, test, lint, or dev commands until the scaffold lands. When commands exist, list the smallest useful set here and keep them current.

Expected future commands:

```bash
npm install
npm run dev
npm run build
npm run check-types
npm run lint
npm run test
```

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
