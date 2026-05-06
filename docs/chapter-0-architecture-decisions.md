# Chapter 0 — Architecture Decisions

**Status:** Reset Decision Registry  
**Doc Class:** Decision Document  
**Scope:** Foundational architecture decisions for `teligant-horizon`  
**Canonical Authority:** Implementation authority for decisions recorded here once marked DECIDED  
**Created:** 2026-04-20  
**Reset:** 2026-05-06  

## Purpose

This document records the foundational architecture decisions for the Horizon storefront foundation.

The project has been reset: Horizon is no longer being evaluated as a storefront plus external commerce-backend composition. It is the reusable storefront code foundation for customer-owned custom storefronts that integrate with `teligant-headless`.

Until a decision is marked DECIDED, downstream code should not depend on it.

## Decision Statuses

- **DECIDED** — final for current foundation work; downstream code must conform.
- **RECOMMENDED** — strong direction; remaining gates named.
- **PENDING** — not decided; code requiring the decision cannot land.
- **SUPERSEDED** — old direction replaced by the 2026-05-06 reset.

## Decision Registry

| # | Decision | Status | Resolution |
|---|----------|--------|------------|
| D01 | Framework | DECIDED | Next.js 16 + React + TypeScript on Node 24 LTS with npm workspaces. Kit primitives runtime-agnostic at the React layer; Next-specific helpers in a separate sub-export. |
| D02 | Repo shape | DECIDED | Monorepo with `apps/reference` + `packages/kit` exactly as drawn in D02 detail. |
| D03 | Styling model | DECIDED | Lattice tokens as runtime CSS custom properties + Tailwind v4 with semantic theme bindings. No CSS-in-JS. |
| D04 | Customer instantiation mechanism | DECIDED | Hybrid: published `packages/kit` consumed as a versioned dependency + starter template seeding the customer app shell. Customer projects own brand, content, deployment, domain. |
| D05 | Adapter strategy | DECIDED | Hand-authored typed Teligant adapters with real + mock implementations. Posture per capability tracked in `docs/seam/headless-surface-status.md`. |
| D06 | Testing strategy | DECIDED | Vitest + React Testing Library + axe + msw-backed adapter contract tests + Playwright e2e. Visual regression deferred to Chapter 4/5. |
| D07 | Governance model | DECIDED | Lattice = design authority; Headless authority stack = regulated workflow authority; AGENTS/CLAUDE = repo operations |
| D08 | Deployment model | DECIDED | Vercel default for reference app and starter template; kit boundary deployment-agnostic; customer storefronts deploy to customer-owned infrastructure. |
| D09 | Analytics / consent posture | PENDING | Deferred deliberately. Due before Chapter 7 (reference storefront) is considered complete. No analytics SDK imports in the kit until decided; no PHI in any analytics payload. |
| D10 | Upgrade path | PENDING | Deferred deliberately. Due before Chapter 10 (first customer instantiation). Until decided, treat the kit as `0.x` — breaking changes allowed with a migration note. |
| D11 | Commerce backend source | SUPERSEDED | Horizon does not assume an external commerce backend; customer-side commerce remains customer-owned unless a later authority says otherwise |
| D12 | Content model | PENDING | Deferred deliberately. Due before Chapter 7 reference storefront content is finalized. No CMS adapter or runtime CMS dependency in the kit until decided. |

---

## D01 — Framework

**Status:** DECIDED

**Decision:** Next.js 16 + React + TypeScript on Node 24 LTS with npm workspaces.

**Locked constraints:**

- Node 24 LTS (matches `teligant-headless`).
- npm workspaces (matches `teligant-headless`).
- TypeScript-first with narrow explicit types (already in `AGENTS.md` § Coding Preferences).
- Next.js 16 in `apps/reference` and in any starter template emitted from this foundation.
- `packages/kit` primitives may use React + TypeScript only. Next-specific helpers (image, link, route helpers, server actions) live in a separate sub-export so a future non-Next surface is not blocked.

**Rationale:** See `docs/chapter-0-lock-in-recommendations.md` § D01. Cross-repo coherence with `teligant-headless` (same runtime, package manager, Next major) reduces context-switching cost for shared contributors and lets typed adapter packages share toolchain. Hybrid runtime-agnostic-at-the-kit-layer + Next-everywhere-else preserves the option to support non-Next consumers later without forcing the choice now.

---

## D02 — Repo Shape

**Status:** DECIDED

**Decision:** Monorepo with one app and one package to start.

```txt
teligant-horizon/
├── apps/
│   └── reference/        # Brand-neutral reference storefront (Next.js 16)
├── packages/
│   └── kit/              # Reusable primitives, archetypes, adapters, types, tokens
├── docs/
├── package.json          # npm workspaces root
├── package-lock.json
├── tsconfig.base.json
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

**Locked constraints:**

- One monorepo root.
- One `packages/kit` to start. Resist splitting prematurely; promote sub-packages only when there is a real consumer that needs the smaller surface.
- One `apps/reference` to start. Customer-specific reference content does not live here (per Customer Instantiation Discipline in `AGENTS.md`).
- An `apps/starter-template/` may be added later under D04's hybrid follow-up; it is not required for Chapter 1 scaffold.

**Rationale:** Cross-repo coherence with `teligant-headless` (also a small `apps/*` + `packages/*` monorepo). Separates reusable foundation code from one reference consumption. Keeps customer-neutral code out of customer-specific projects. Gives the team a stable internal demo surface. See `docs/chapter-0-lock-in-recommendations.md` § D02.

---

## D03 — Styling Model

**Status:** DECIDED

**Decision:** Lattice tokens as runtime CSS custom properties, consumed by **Tailwind v4** utility classes via semantic theme bindings.

**Locked constraints:**

- Lattice owns token semantics.
- Lattice tokens are emitted as CSS custom properties at the document root and (for density / theming) at scoped surfaces.
- Tailwind v4 `@theme` (or equivalent) maps semantic tokens to Tailwind classes. Components consume semantic Tailwind classes, never raw OKLCH values.
- Customer skins override CSS variables and content, not component internals.
- Hardcoded color, spacing, or font-size values are forbidden inside `packages/kit/src/**`. Tokens only. Enforce with a lint rule when scaffold lands.
- No CSS-in-JS runtime libraries (emotion, styled-components, vanilla-extract). PostCSS + Tailwind only.
- The foundation must support multiple customer skins without rewriting archetypes.

**Rationale:** Lattice is built on OKLCH variables and runtime variable logic, which means the styling implementation must express CSS custom properties at runtime. Tailwind v4's CSS-first config consumes CSS variables natively. CSS-in-JS is rejected because it tends to bake values at build time and fights runtime variable swapping (which is how skin override works). CSS Modules alone is rejected because it does not compose well with the dense semantic-token usage that Lattice archetypes require. Cross-repo coherence: `teligant-headless` admin/intake also use Tailwind v4. See `docs/chapter-0-lock-in-recommendations.md` § D03.

---

## D04 — Customer Instantiation Mechanism

**Status:** DECIDED

**Decision:** Hybrid — published kit package + starter template.

**Shape:**

- **Package side:** `packages/kit` is published privately as a versioned npm package (private scope, e.g. `@teligant/horizon-kit`). Customers consume it as a versioned dependency. Carries primitives, archetypes, adapters, types, tokens, and Lattice expression.
- **Template side:** A starter template (initially `apps/reference`, later potentially a dedicated `apps/starter-template` or a sibling repo) seeds the customer project's app shell, route composition, deployment config, and content scaffolding. The template depends on the kit package; it does not re-export kit internals.
- **Customer project layout:** customer-owned repo, customer-owned domain, customer-owned deployment. Customer skin (token overrides + content + imagery + copy) lives in the customer project, not in the foundation.

**Locked constraints:**

- Kit is the sole upgrade surface. Bug fixes and archetype improvements ship through the kit package, not through template re-templating.
- Template owns app-shell, route layout, deployment config, and content scaffolding only.
- Customer projects own brand expression, content, copy, imagery, domain, deployment, and analytics. None of that lives in the kit or the template.
- A customer project is, by construction, a downstream consumer of a specific kit version. Breaking changes follow D10 once D10 is locked.

**Open follow-ups (do not block Chapter 1):**

- Whether the starter template lives in this repo (as `apps/starter-template`) or in a sibling repo. Default: in-repo until there is a real reason to split.
- Private registry choice for the kit package. Default: npm with a private scope unless infra constraints say otherwise.

**Rationale:** Hybrid resolves the central tension: the kit gets the upgrade-path leverage of a versioned package, and the template gets the first-customer speed of a copy-and-customize starting point. The foundation→customer-project boundary stays clean because customer-specific code never lands in the kit. See `docs/chapter-0-lock-in-recommendations.md` § D04.

---

## D05 — Adapter Strategy

**Status:** DECIDED

**Decision:** Hand-authored typed adapters to `teligant-headless`. Real adapters for shipped Headless surfaces; labeled mock adapters for explicitly planned surfaces when the mock matches the intended v1 contract.

**Locked rules:**

- Components do not call `teligant-headless` directly. All calls go through typed adapters.
- Secret-bearing calls run server-side. The adapter exports a server-only sub-entry that fails fast if imported into a client bundle (per D08).
- Adapter types reflect authoritative or explicitly planned Headless contracts. Drift from the Headless contract is a blocking defect per `docs/agents/senior-principal-engineer-office-of-the-cto-agent.md` § Headless Seam Discipline Rule.
- Mock adapters must be clearly labeled at the call site and in adapter exports. Mock fixtures must be shared with the contract test layer (D06) so mock drift from real Headless surfaces is caught in tests, not in production.
- Per-capability adapter posture (Real / Mock-only / Not-yet) is tracked in `docs/seam/headless-surface-status.md`. That doc is the source of truth for which adapter shape is allowed today; re-sync when Headless ships a tranche or ratifies an authority doc.
- Adapters preserve tenant scoping, idempotency-key support where relevant, and PHI minimization (per `AGENTS.md` Adapter Discipline).

**Initial adapter surfaces** (with current posture from `docs/seam/headless-surface-status.md`):

- intake-session creation — **Real** (Headless T1 shipped).
- hosted-intake handoff — **Real**, minimal (Headless T2 shipped; storefront renders the handoff affordance into the hosted runtime URL).
- care-request status lookup where authorized — **Real**, non-PHI surface only (Headless T3/T3p shipped).
- Branch A commerce handoff — **Mock-only** until Headless ships the matching runtime tranche; commerce_orchestration authority is ratified.
- Payment attestation and capture eligibility — **Mock-only** under Branch A; same cut-over rule.
- Webhook receive helpers — **Real** for inbound webhook patterns (Headless T4 shipped).

**Rationale:** Hand-authored typed adapters are the simplest model that preserves contract clarity, server-only secret handling, and per-capability discipline. Code-generation from an OpenAPI spec was considered and deferred — Headless does not yet publish a stable OpenAPI artifact, and hand-authored adapters give us per-call PHI-minimization control that codegen would not. Revisit if Headless publishes a stable contract artifact.

---

## D06 — Testing Strategy

**Status:** DECIDED

**Decision:** Five-layer testing stack.

| Layer | Tool | Scope |
|---|---|---|
| Unit | **Vitest** | token utilities, adapter serialization, helpers, hooks |
| Component | **Vitest + React Testing Library** | primitives, archetype rendering, prop contracts |
| Accessibility | **axe-core** (via `@axe-core/playwright` and a Vitest matcher) | primitives + archetype-level a11y assertions |
| Adapter contract | **Vitest + msw (or equivalent)** | request shape, error envelope, idempotency, PHI minimization, mock-vs-real parity |
| Browser smoke | **Playwright** | reference storefront flows end-to-end |

**Required commands at scaffold time:**

```bash
npm run check-types           # tsc across workspaces
npm run lint                  # ESLint + Prettier check
npm run test                  # vitest run --passWithNoTests per workspace
npm run test:e2e              # playwright (skipped in unit CI lane)
npm run build                 # next build for reference app; no-op for kit unless typegen needed
```

**Locked constraints:**

- Adapter tests must assert *both* request shape and response handling, including error envelope normalization, idempotency keys where relevant, and PHI minimization (no PHI fields appearing in storefront-rendered surfaces).
- Mock adapters (per D05) must share their response fixtures with the contract test layer, so mock drift from real Headless surfaces is caught in tests, not in production.
- Visual regression is **deferred** to Chapter 4/5 (archetype-heavy chapters). It is not scaffold-load-bearing and Playwright snapshots will likely cover most of the value.

**Rationale:** Vitest matches `teligant-headless`. Testing Library is the React-component standard. axe is the lowest-friction a11y net. msw lets adapter tests assert against the documented Headless contract shape without spinning up a real backend. Playwright is the cleanest browser-smoke choice. See `docs/chapter-0-lock-in-recommendations.md` § D06.

---

## D07 — Governance Model

**Status:** DECIDED

**Decision:** Governance is layered:

1. **Lattice** owns design authority.
2. **`teligant-headless` authority docs** own regulated workflow, commerce posture, tenant isolation, PHI handling, patient access, audit, and API contracts.
3. **`AGENTS.md` and `CLAUDE.md` in this repo** own Horizon-specific operating rules.

**Implications:**

- New design tokens or general archetypes route through Lattice.
- Backend contract changes route through `teligant-headless`.
- Horizon can add reusable telehealth storefront archetypes when they do not redefine Lattice or backend behavior.

---

## D08 — Deployment Model

**Status:** DECIDED

**Decision:** Vercel as the default deploy target with a deployment-agnostic kit boundary.

**Shape:**

- The reference app and the starter template default to Vercel deployment. CI examples and runbooks target Vercel first.
- The kit package itself imports nothing Vercel-specific. Server-only adapter helpers use Web standard APIs (Request/Response, fetch) that work on Vercel, Cloudflare Workers, Node servers, and AWS Lambda alike.
- Customer storefronts deploy to **customer-owned infrastructure**. Vercel is the recommended default; it is not required.

**Locked constraints:**

- Reference app: Vercel by default; documented `next build` works without Vercel-only APIs.
- Kit: no imports from `@vercel/*` or platform-specific runtimes in `packages/kit/src/**`. Enforce with a lint rule when scaffold lands.
- Server-only credential handling: environment variables only, never browser bundles. Adapter exports a server-only sub-entry that fails fast if imported into a client bundle.
- Self-hosting support is **not** a Chapter 0 commitment. It is allowed but not required; revisit if a customer requires it.

**Rationale:** `AGENTS.md` non-negotiables require customer-owned deployment. `teligant-headless` runs on Vercel Fluid Compute, so a Vercel-default Horizon keeps cross-repo operational knowledge aligned. Locking deployment-agnostic at the *kit* boundary preserves the option for a customer with platform constraints (regulated hosting, in-house Kubernetes, Cloudflare Workers) without forking the foundation. See `docs/chapter-0-lock-in-recommendations.md` § D08.

---

## D09 — Analytics / Consent Posture

**Status:** PENDING (deferred deliberately)

**Decision due:** Before Chapter 7 (reference storefront) is considered complete.

**Why deferred:** No scaffold code depends on this. Chapter 7 will reveal whether typed analytics hooks, a consent-banner primitive, or staying out of analytics entirely is the right posture for customer projects.

**Provisional guardrail until decided:** No analytics SDK imports in the kit. No PHI in any future analytics payload (already in `AGENTS.md`).

**Open questions to resolve at decision time:**

- Does Horizon provide typed analytics hooks or stay out of analytics entirely?
- Does Horizon include consent-banner primitives?
- How do customer-owned analytics avoid PHI leakage?
- Which events are safe for storefront analytics versus regulated audit?

---

## D10 — Upgrade Path

**Status:** PENDING (deferred deliberately)

**Decision due:** Before Chapter 10 (first customer instantiation).

**Why deferred:** Chapters 1 through 6 will land on a fast-iteration foundation where breaking changes are expected. Locking semver discipline before there is a stable kit surface area would be premature.

**Provisional guardrail until decided:** Treat the kit as `0.x` — breaking changes allowed with a migration note in CHANGELOG. When D04's hybrid template work begins, that is the trigger to lock D10.

**Open questions to resolve at decision time** (D04 is now `DECIDED` as hybrid, so the relevant subset is):

- Semver policy for the kit package and migration-doc cadence.
- Starter-template migration cadence and support policy.
- What belongs in the package versus the starter template (refined from real Chapter 1–6 experience).

---

## D11 — Commerce Backend Source

**Status:** SUPERSEDED

**Decision:** Horizon does not assume an external commerce backend as part of its foundation architecture.

The storefront foundation should support customer-owned commerce / checkout responsibilities on the customer side of the seam and integrate with `teligant-headless` through the approved posture. Branch A is the default headless posture. Branch B is reserved / controlled rollout and cannot be implemented here without explicit authority.

**Implications:**

- No external commerce-backend adapter is part of Horizon's foundation.
- No commerce-platform extension package is part of Horizon's foundation.
- Checkout, payment processor relationship, refunds, disputes, and customer-side commerce operations remain customer-owned unless an authority doc says otherwise.
- Horizon may provide storefront presentation and handoff helpers, but not a payment rail or regulated commerce state machine.

---

## D12 — Content Model

**Status:** PENDING (deferred deliberately)

**Decision due:** Before Chapter 7 reference storefront content is finalized.

**Why deferred:** The content model interacts with D04 (hybrid) and Chapter 8 (customer skin + content model). Locking it now risks baking in assumptions that customer projects will have to fight. Defer until at least one archetype set has been built and the shape of "content slot" vs "page composition" is concrete from real archetype usage.

**Provisional guardrail until decided:** No CMS adapter or runtime CMS dependency added to the kit.

**Open questions to resolve at decision time:**

- File-based content objects, CMS adapter hooks, or customer-repo-owned content modules?
- How are page compositions represented?
- How are customer copy, imagery, legal disclaimers, and product presentation versioned?
- What content can safely appear in the storefront without drifting into regulated workflow?

---

## What Lands Next

Chapter 0 is gate-open for Chapter 1 (Scaffold + Charter) and Chapter 6 (Typed Teligant Adapters). The Chapter 1 blockers (D01, D02, D03, D04, D06, D08) and the Chapter 6 blocker (D05) are all `DECIDED`. Remaining `PENDING` entries (D09, D10, D12) are deferred deliberately and have named due dates that fall after Chapter 1.

## Amendment Log

- **2026-05-06** — Reset D11 to SUPERSEDED and removed external commerce-backend assumptions. Reframed Horizon as storefront code foundation for customer-owned custom storefront projects that integrate with `teligant-headless`.
- **2026-05-06** — Ratified D01, D02, D03, D04, D06, D08 to DECIDED based on `docs/chapter-0-lock-in-recommendations.md`. Chapter 0 is gate-open for Chapter 1. D09, D10, D12 affirmed as deferred-with-named-due-dates. D05 remained RECOMMENDED.
- **2026-05-06** — Ratified D05 to DECIDED. Hand-authored typed adapters with real + mock posture; per-capability posture tracked in `docs/seam/headless-surface-status.md`. Chapter 0 is now also gate-open for Chapter 6.
