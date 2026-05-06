# teligant-horizon

Storefront code foundation for intelligent custom telehealth storefronts.

This repo is the governed starting point for customer-owned storefront projects that integrate with `teligant-headless`. It provides the reusable frontend foundation: Lattice-based design primitives, telehealth storefront archetypes, typed adapters, reference composition, and customer-instantiation guidance.

Think of it as the base theme/foundation Teligant starts from when building a bespoke storefront for a customer. The customer owns the brand, content, domain, deployment, analytics, pricing presentation, and checkout surface. Teligant owns the regulated workflow behind the API seam: intake, care requests, provider review, status contracts, webhooks, audit, and admin/provider operations.

## Status

Foundation reset in progress. This repo is being redefined around the Teligant storefront delivery model and should not inherit old commerce-platform assumptions.

## Start Here

1. [`AGENTS.md`](./AGENTS.md) — repo purpose, scope, and agent rules.
2. [`CLAUDE.md`](./CLAUDE.md) — operational notes for Claude Code and other agents.
3. [`docs/roadmap.md`](./docs/roadmap.md) — roadmap for the storefront foundation.
4. [`docs/chapter-0-architecture-decisions.md`](./docs/chapter-0-architecture-decisions.md) — architecture decision registry.

## Strategic Context

The storefront delivery model is described in:

- `/Users/kellysmith/Projects/teligant-headless/docs/explainers/two-integration-scenarios.md`
- `/Users/kellysmith/Projects/teligant-headless/docs/product/product-contract.md`
- `/Users/kellysmith/Projects/teligant-headless/docs/product/commerce-orchestration-authority.md`

The design language this foundation implements is the Lattice design system, canonical at `/Users/kellysmith/Projects/lattice-design-system/`.
