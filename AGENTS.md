# AGENTS.md

## Purpose

This repository is the storefront code foundation for Teligant custom storefront projects.

It exists because Teligant Headless v1 is not a hosted storefront builder. The regulated backend lives in `/Users/kellysmith/Projects/teligant-headless`; customer-owned storefronts live on the customer side of the API seam. This repo is the reusable frontend foundation Teligant uses to build those customer-owned storefronts quickly, consistently, and without dragging regulated workflow into the customer's marketing surface.

In plain English: this repo is the base theme/foundation for intelligent custom telehealth storefronts. A customer project starts here, applies a customer-specific Lattice skin, composes reusable telehealth storefront archetypes, wires typed Teligant adapters, and deploys to customer-owned infrastructure.

The goal is not generic frontend scaffolding. The goal is to create a durable, governed storefront foundation for repeatable customer delivery.

## Product Boundary

The storefront foundation owns:

- brand-neutral storefront primitives
- Lattice token implementation
- reusable telehealth storefront archetypes
- customer-skin installation patterns
- typed adapters to Teligant Headless APIs
- reference storefront composition
- customer-instantiation runbooks
- safe mock adapters for planned backend capabilities

The storefront foundation does **not** own:

- regulated workflow
- PHI storage
- provider review
- clinical messaging internals
- audit logs
- tenant isolation enforcement
- API-client credential issuance
- admin/provider operations
- patient portal internals
- payment processor relationships
- raw card data
- customer billing operations

Those belong to `teligant-headless`, the customer, or the customer's payment/commerce infrastructure depending on the approved posture.

## Relationship To Teligant Headless

`teligant-headless` is the regulated workflow system. This repo is the customer-side storefront foundation.

The seam is:

```txt
customer storefront
  -> typed server-side adapter
  -> Teligant v1 API
  -> hosted intake / patient portal / regulated workflow
```

The storefront may initiate handoff, render customer-owned product and program pages, and display non-PHI status affordances when authorized. It must not become the regulated system of record.

When in doubt, read:

- `/Users/kellysmith/Projects/teligant-headless/AGENTS.md`
- `/Users/kellysmith/Projects/teligant-headless/docs/explainers/two-integration-scenarios.md`
- `/Users/kellysmith/Projects/teligant-headless/docs/product/product-contract.md`
- `/Users/kellysmith/Projects/teligant-headless/docs/product/commerce-orchestration-authority.md`
- `/Users/kellysmith/Projects/teligant-headless/docs/product/status/status.yaml`

## Horizon Analogy

This repo is named in deliberate reference to Shopify Horizon: a modern theme foundation that gives developers a high-quality starting point for custom storefront work. The analogy is useful because Horizon-style development starts from a governed base, then adapts layout, blocks, theme settings, and brand expression for a specific merchant.

For Teligant, the equivalent is a high-quality custom storefront foundation that makes customer delivery faster without turning the product into a merchant page-builder.

Use that analogy carefully:

- Good analogy: reusable base, governed sections, composable blocks/archetypes, customer-specific skinning, faster custom implementation.
- Bad analogy: in-admin merchant editing scope, generic theme marketplace behavior, unrestricted page-builder flexibility, or customer-controlled regulated workflow.

This repo should give a Teligant team a running head start on bespoke storefront delivery. It should not become a generalized storefront product.

## Two Integration Scenarios

The current customer-side model has two storefront delivery scenarios:

1. **BYO Storefront** — the customer keeps an existing site and integrates with Teligant APIs directly.
2. **Teligant Scaffolding** — Teligant uses this foundation to produce a customer-owned storefront with reusable archetypes, a Lattice skin, and typed adapters.

This repo primarily serves Scenario 2. It should also produce adapter patterns and examples that help Scenario 1 customers integrate cleanly without copying internal kit code wholesale.

## Non-Negotiable Rules

### Customer-Owned Surface

- Customer projects own brand, layout, content, imagery, domain, deployment, analytics, and customer-side conversion.
- Do not build a hosted storefront builder.
- Do not build a CMS or page-builder.
- Do not add merchant-controlled theme editing as a product surface.
- Do not move Teligant admin/provider workflows into the storefront.

### Regulated Boundary

- Do not store PHI in storefront state, fixtures, logs, analytics payloads, or local demo data.
- Do not expose API keys or tenant credentials to browser bundles.
- Do not fetch questionnaire answers, provider notes, clinical messages, or audit-only data into customer storefront pages unless a future authority explicitly allows it.
- Patient handoff to hosted intake or patient portal surfaces must follow the locked Teligant Headless contract.

### Adapter Discipline

- All Teligant API calls go through typed adapters.
- Adapters must preserve tenant scoping, idempotency, error envelopes, and PHI minimization.
- Mock adapters must be explicitly labeled and match the intended Headless v1 contract.
- Do not create local API contracts that drift from `teligant-headless`.

### Lattice Discipline

- Lattice owns tokens, typography, spacing, color semantics, surfaces, states, motion, and general archetype rules.
- This repo may add telehealth-specific storefront archetypes only when they are reusable across customers.
- Customer-specific visual invention belongs in the customer skin or customer project, not in foundation code.

### Commerce / Checkout Discipline

- Branch A is the default headless posture: the customer owns checkout and payment processor relationship; Teligant receives handoff into regulated workflow.
- Branch B is reserved / controlled rollout and requires explicit authority before this foundation should implement a checkout path for it.
- Do not accept raw card data.
- Do not introduce a margin engine, take-rate, payment rail, billing engine, or pharmacy fulfillment runtime.

## Current Workspace Shape

The repo is still a foundation reset. The intended shape is:

```txt
apps/
  reference/     Brand-neutral reference storefront

packages/
  kit/           Reusable storefront primitives, archetypes, adapters, and types
```

Do not scaffold more surface area until `docs/chapter-0-architecture-decisions.md` authorizes it.

## Coding Preferences

- TypeScript-first.
- Narrow explicit types.
- React/Next.js only where Chapter 0 confirms the stack.
- Server-side adapters for secret-bearing calls.
- Accessible, responsive, mobile-first storefront components.
- Lattice tokens over hardcoded design values.
- Small reusable archetypes over customer-specific abstractions.

## Validation Expectations

Once code exists, prefer targeted validation:

- type-check affected packages/apps
- lint affected packages/apps
- component tests for primitives and archetypes
- visual regression for high-level storefront sections
- adapter tests for request shape, error handling, and PHI minimization
- browser smoke tests for reference storefront flows

If validation cannot run because the scaffold does not exist yet, say so clearly.

## Good Default Execution Approach

1. Read this file, `CLAUDE.md`, and the relevant roadmap/decision docs.
2. Confirm the requested work belongs in the storefront foundation, not `teligant-headless` or a customer repo.
3. Check the Headless authority stack when a change touches intake, commerce handoff, patient access, webhooks, PHI, or tenant scoping.
4. Match existing docs and code style.
5. Keep changes narrow.
6. Validate with the smallest useful commands available.
7. Summarize what changed and what remains intentionally out of scope.

## Stop Conditions

Stop and escalate if a request would:

- turn this foundation into a hosted storefront builder or CMS
- implement regulated workflow locally
- decide patient auth, payment semantics, PHI handling, or tenant isolation in storefront code
- expose secret-bearing API calls to the browser
- introduce raw card data handling
- add customer-specific logic to the reusable foundation
- create a new Lattice token or general archetype without design authority
- implement Branch B checkout without explicit authority
- revive old commerce-platform assumptions without a new architecture decision
