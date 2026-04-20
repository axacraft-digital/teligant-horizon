# Chapter 0 — Architecture Decisions

**Status:** Living Decision Registry
**Doc Class:** Decision Document
**Scope:** The foundational architecture decisions for `teligant-headless-storefront` that must be locked before application code lands, per `docs/roadmap.md` Part I, Chapter 0
**Canonical Authority:** Implementation authority for the decisions recorded here. When this document and downstream code disagree, this document is the first thing to reconcile against.
**Created:** 2026-04-20

## Purpose

This document records the foundational architecture decisions for the storefront kit and the reasoning behind each. It is a **living** document. Entries land as decisions are made; nothing about "what this kit is" is complete without this document being filled in.

Per `docs/roadmap.md` Chapter 0, no application code lands in this repo until the decisions recorded here are sufficient to write code without inferring architectural posture. Each decision carries one of four statuses:

- **DECIDED** — decision is final; downstream work must conform.
- **IMPLIED** — strong contextual bias exists (usually alignment with `teligant-headless` and `hedfirst-website`) but the decision has not been formally ratified. Treat as soft-locked pending explicit ratification; the act of writing the corresponding scaffold config is the ratification moment.
- **RECOMMENDED** — directional lean-in after research; remaining gates explicitly named; ready to flip to DECIDED when gates pass. Code that depends on the specific direction should not land yet; code that is direction-agnostic can proceed. Downstream decisions can be pre-thought against the recommendation.
- **PENDING** — decision is not yet made; code that requires the decision cannot land.

## Decision Registry

| # | Decision | Status | Resolution |
|---|----------|--------|------------|
| D01 | Framework | IMPLIED | Next.js 16 App Router + React 19 + TypeScript, aligned with `teligant-headless` and `hedfirst-website` |
| D02 | Repo shape | DECIDED | Monorepo — `/packages/kit` + `/apps/reference`; customer instantiations live in separate customer-owned repos |
| D03 | Styling model | IMPLIED | Tailwind CSS 4 + CSS custom properties for Lattice tokens; shadcn/ui primitives where applicable |
| D04 | Customer instantiation mechanism | DECIDED | Published kit package consumed by separate customer-owned repos ("Shape 2"). Updates flow via semver npm package upgrades, not git merges |
| D05 | Adapter strategy | RECOMMENDED | Two-backend adapter surface — generated SDK for Medusa commerce (if D11 flips), hand-authored typed adapters for Teligant clinical. Gated on D11 becoming DECIDED |
| D06 | Testing strategy | PENDING | Mix of unit, component, visual regression, and end-to-end to be scoped |
| D07 | Governance model | DECIDED | Lattice = design authority; `systems-approach.md` = workflow authority; `CLAUDE.md` = repo operational authority |
| D08 | Deployment model | IMPLIED | Vercel as default target; kit remains deployment-agnostic in principle |
| D09 | Analytics posture | PENDING | Whether the kit ships analytics/consent/A-B hooks, adapters, or stays out of it |
| D10 | Upgrade path | DECIDED | Customer deployments opt into kit updates via semver package upgrades; breaking changes accompanied by migration docs |
| D11 | Commerce backend source | RECOMMENDED | Medusa 2.x as commerce backend alongside `teligant-headless` as regulated clinical backend. Gated on Teligant patient-auth audit + Stripe manual-capture / multi-capture prototype. See [`evaluations/commerce-backend-medusa.md`](./evaluations/commerce-backend-medusa.md). Affects D05 and roadmap Ch 6 |

---

## D01 — Framework

**Status:** IMPLIED — to be ratified when Chapter 1 scaffold lands.

**Decision (soft):** Next.js 16 with App Router, React 19, TypeScript.

**Alternatives considered:**
- **Astro** — excellent for static marketing sites; weaker fit for transactional (cart, checkout, session) surfaces the kit targets. Rejected.
- **Remix** — strong data-loading ergonomics; smaller ecosystem; diverges from sibling repos. Rejected.
- **Vite + React SPA** — fine for pure SPA; loses SSR/SEO benefits that matter for catalog and PDP. Rejected.

**Reasoning:**
- `teligant-headless` and `hedfirst-website` are both on Next.js 16 + React 19 + App Router. Same-DNA alignment across the three-repo topology keeps tooling, mental model, and deployment target unified.
- Next.js App Router handles the mix of static (PLP, PDP, content pages) and dynamic (cart, checkout) surfaces the kit needs without separate frameworks.
- Same-stack alignment across all three repos is a precondition for the "one team delivers both halves" operational advantage named in `telehealth-storefront-delivery-ambition.md`.

**Implications:**
- React Server Components available by default for non-interactive surfaces.
- Turbopack dev server applies. The SST-cache gotcha documented in `hedfirst-website/CLAUDE.md` (never `rm -rf .next` with the dev server running) carries into this repo.

---

## D02 — Repo Shape

**Status:** DECIDED

**Decision:** This repo is a monorepo with at minimum `/packages/kit` and `/apps/reference`. Customer instantiations live in **separate customer-owned repositories outside this one** and consume the kit as a versioned package.

**Structure (initial):**

```
teligant-headless-storefront/
├── packages/
│   └── kit/                  # Reusable componentry, archetypes, adapters, types
├── apps/
│   └── reference/            # Canonical reference storefront (brand-neutral Lattice skin)
├── docs/
│   ├── roadmap.md
│   └── chapter-0-architecture-decisions.md
├── CLAUDE.md
└── README.md
```

Additional workspace members (e.g., `packages/tokens`, `packages/adapters`, `apps/playground` for component-level visual review) can be added later but are not required on day one.

**Tooling:** pnpm workspaces assumed; to be ratified when scaffold lands.

**Alternatives considered:**
- **Single-app scaffold** (kit code inline in one Next.js app) — rejected. Loses the "kit is reusable artifact, reference is one consumption" distinction and muddies the governance boundary between customer-neutral and customer-specific code.
- **Separate repos for kit and reference** — rejected. Forces publishing discipline on day one before the kit API has stabilized.

**Reasoning:**
- The monorepo enforces the architectural boundary between kit code (customer-neutral) and reference code (one consumption) via directory structure rather than developer discipline alone.
- `/apps/reference` serves triple duty: (1) kit dogfood, (2) live proof-of-work demo asset, (3) structural starting point customer repos copy from.
- Workspace-referencing the kit during development (`"@teligant/storefront-kit": "workspace:*"`) avoids the "publish before API stabilizes" trap while still enforcing package boundaries.

**Implications:**
- Roadmap Chapter 7 ("Reference Surface") collapses into `/apps/reference` as a living artifact that grows as archetypes land. Chapter 7 is no longer a discrete chapter; it is ongoing.
- First kit publish event happens after the kit API has stabilized (likely after Hedfirst launches and an early second-customer build has exercised the kit against a second real instance).

---

## D03 — Styling Model

**Status:** IMPLIED — to be ratified when Chapter 1 scaffold lands.

**Decision (soft):** Tailwind CSS 4 for utility-level styling; CSS custom properties for Lattice tokens (colors, type scale, spacing ladder, density, surfaces, motion durations); shadcn/ui primitives where they apply as structural containers (button, card, badge, input scaffolds).

**Alternatives considered:**
- **Pure CSS modules** — cleaner concern separation, higher ceremony, loses utility composition speed. Rejected.
- **CSS-in-JS (Emotion/Styled)** — runtime cost, poor fit for React Server Components, diverges from sibling repos. Rejected.
- **Vanilla CSS with PostCSS tooling only** — minimal runtime, loses composition ergonomics, more boilerplate per surface. Rejected.

**Reasoning:**
- `hedfirst-website` is already on Tailwind CSS 4 + CSS custom properties + shadcn/ui. Matching that stack minimizes friction for the first real customer.
- CSS custom properties are the native expression of Lattice tokens. They compose cleanly with Tailwind via arbitrary values (`bg-[var(--surface-raised)]`) and support runtime theme switching, which matters for the per-customer skin model.
- Lattice is token-led by design; a styling model that isn't token-first would fight the design system.

**Implications:**
- Chapter 2 ("Port Lattice Foundations to Code") is CSS-variable-authored, consumed by Tailwind utilities and component styles.
- Per-customer Lattice skins are token file overrides (a single CSS file or TS module that redefines custom property values), not component rewrites.

---

## D04 — Customer Instantiation Mechanism

**Status:** DECIDED

**Decision:** Customer instantiations are **separate customer-owned repositories that consume this repo's kit as a versioned package.** Kit updates flow to deployed customer sites via opt-in npm package upgrades, not git merges or automatic pushes.

**Shape:**

```
[this repo — kit source of truth]       [customer repo — deliverable artifact]
teligant-headless-storefront      →      hedfirst-storefront
├── packages/kit          ─npm─▶         ├── package.json
├── apps/reference                        │   └── "@teligant/storefront-kit": "^0.x"
└── ...                                   ├── src/
                                          │   ├── skin/          (Hedfirst Lattice skin)
                                          │   ├── content/       (Hedfirst-specific copy/data)
                                          │   └── app/           (Next.js app composing kit archetypes)
                                          └── ...
```

**Alternatives considered:**

- **Fork the entire foundation repo per customer ("Shape 1").** Customer clones this repo, edits inline, rebases from upstream for updates. Rejected because git-merge conflict burden grows unboundedly as customer and kit diverge, and per-customer forks have no clean way to receive kit improvements without manual reconciliation in every file touched.
- **Single Next.js app with subdomain routing (marketing + storefront same app).** Rejected because marketing and transactional surfaces have different lifecycles, design systems, operational profiles, and access models; entangling them destroys the kit's artifact-shape repeatability.
- **Generator (`npx create-teligant-storefront`).** Not rejected — deferred. Manual clone of `/apps/reference` as the starting point is sufficient for customers #1 and #2. Graduate to a generator if and when the manual steps become repetitive enough to justify automating; three customers' worth of manual setup is often less total effort than building and maintaining a generator.

**Reasoning:**
- The kit's strategic bet is that customer N is materially faster to onboard than customer 1 (roadmap Ch 12). Fork-based distribution does not hold that shape — each fork is an island and kit improvements either require per-file merge conflicts or never arrive.
- Package-based distribution preserves the kit as the single canonical artifact, lets customer repos stay thin (skin + content + composition), and gives customer deployments a clean opt-in path for kit updates.
- The monorepo boundary between `/packages/kit` (customer-neutral) and `/apps/reference` (one consumption) is the structural firewall that keeps customer-specific decisions out of kit code. This is architectural governance, not cultural governance.

**Publishing posture:**
- **Phase 1 (now → Hedfirst launch):** kit is workspace-referenced inside this monorepo. Customer repos during development reference it via `file:` or `link:` protocol pointing at a local checkout of this repo. No npm publish yet. Pre-1.0 semver.
- **Phase 2 (after Hedfirst launch):** kit graduates to a published private npm package (registry choice to be made — see D08 neighbourhood). Customer repos upgrade to the published version. Still pre-1.0 semver until the API has absorbed a second customer's learnings.
- **Phase 3 (after second-customer launch + hardening):** kit may graduate to semver 1.0 with formal stability guarantees and a documented deprecation policy.

**Implications:**
- Customer repo naming convention: `<customer>-storefront` (e.g., `hedfirst-storefront`). First customer repo is Hedfirst's transactional storefront for `app.hedfirst.com`.
- Kit API design matters from day one because it is the seam customers consume. Breaking changes in the kit API are tracked as migration docs per `systems-approach.md`.
- Roadmap Chapter 7 ("Reference Surface") collapses into `/apps/reference`. Roadmap Chapter 8 ("Customer Instantiation Model Built And Proven") reshapes: the *mechanism* is decided here; the *proving* is Hedfirst's storefront standing up cleanly as the first real instantiation.

---

## D05 — Adapter Strategy

**Status:** RECOMMENDED. Gated on D11 flipping from RECOMMENDED to DECIDED.

**Recommended resolution — two-backend adapter surface:**

- **Commerce (Medusa) → generated SDK.** Medusa 2.x ships a mature published OpenAPI spec. Run a generator (e.g., `openapi-typescript`, `orval`) against it on every build. Types stay honest as Medusa evolves. The storefront consumes generated types directly.
- **Clinical (Teligant) → hand-authored typed adapters.** One TypeScript module per surface (`intake-session.ts`, `care-request.ts`, future patient-auth, etc.). Mock variants live alongside for un-tranched surfaces and are selected via a configurable client. Hand-authored until `teligant-headless` publishes a stable authoritative OpenAPI spec; revisit for generation at that point.

This mixed strategy is deliberate. It optimizes for Medusa's shipped-documented API (where generation is pure upside) while keeping control over the Teligant seam (where the API is still evolving and mocks matter).

**Options considered (for completeness):**
- **Hand-authored across both backends.** Uniform authoring model; loses the honesty-by-default that generation provides against Medusa's moving API.
- **Generated across both backends.** Requires Teligant's OpenAPI spec to be authoritative on day one, which it is not today. Revisit when it is.

**Refinement questions (open within the recommendation, not gating):**
- Mock-adapter pattern for the un-tranched Teligant surfaces — MSW, nock, or hand-authored fake implementations behind the same typed interface? Settle before Chapter 6.
- Customer-repo override and debugging ergonomics — both patterns allow customer repos to wrap or swap adapters for integration debugging; confirm this stays clean in the mixed model.
- Teligant OpenAPI readiness — track whether and when `teligant-headless` publishes an authoritative spec; graduate Teligant adapters to generation at that point.

**Decision due:** Before Chapter 6 (typed adapters) work begins. Flips to DECIDED when D11 does.

---

## D06 — Testing Strategy

**Status:** PENDING

**Factors to resolve:**
- **Unit tests** for pure utilities, token math, adapter serialization. Low-cost, high-value — likely yes. Tool: Vitest (best Tailwind 4 / ESM ergonomics in 2026).
- **Component tests** (React Testing Library) for primitives and archetypes. Likely yes for primitives. Unclear for archetypes, where visual regression may be the better gate.
- **Visual regression** (Chromatic, Playwright snapshots, or similar). High-value for archetype discipline because archetypes are the high-blast-radius surface. Non-trivial to set up and maintain.
- **End-to-end** (Playwright) against `/apps/reference`. Valuable as the kit-works smoke test; expensive to maintain as surfaces grow.
- **CI integration** — what gates a PR? What runs on merge to main? What runs pre-release?

**Decision due:** Before Chapter 1 scaffold lands, so CI has something to run on day one.

---

## D07 — Governance Model

**Status:** DECIDED (codified in existing authority docs; restated here for registry completeness)

**Decision:** Governance is layered across three authority sources:

1. **Lattice** (canonical at `lattice-design-system/`, mirrored at `teligant-headless/docs/design-system/`). Design authority. Any change involving tokens, archetypes, typography, spacing, color, density, surfaces, states, or motion is a Lattice decision first, expressed in the kit second. New archetypes follow Lattice's §8 creation rule.
2. **`systems-approach.md`** (canonical at `teligant-headless/docs/process/`). Workflow governance. Charter-first, ladder-first, archetype-first, mock-adapter-first, migration docs for structural change, audit cadence before each milestone.
3. **`CLAUDE.md` in this repo.** Repo-specific operational rules. Kit is customer-neutral. No direct `teligant-headless` calls. No local tokens when Lattice tokens exist. No customer-specific logic in the kit. No heavy client dependencies without documented reason.

**Who owns adding a new archetype?**
- **Telehealth-specific archetypes** (PDP Questionnaire Gateway, Program / Category Grid, Eligibility / State Gate, Pharmacy and Compliance Disclosure, How-It-Works Explainer): authored in this kit under Lattice's §8 creation discipline. Catalogued in the kit's archetype doc; may graduate upstream to Lattice as a telehealth supplement.
- **General archetypes:** proposed upstream to Lattice first; added to Lattice's canonical archetype catalog before the kit implements them.
- **Per-customer archetypes** discovered during an engagement: authored in the customer repo if single-use; promoted to the kit (or Lattice, if general) if the pattern has reuse potential. Per-customer invention of archetypes that should have been general is a delivery defect.

**Who owns a token ladder change?**
Lattice owns ladders. The kit consumes them. A kit request for a new ladder tier or a new ladder value is a Lattice proposal, not a kit-local addition.

**Who owns upstream promotion?**
Kit maintainer (currently Kelly) evaluates per-customer inventions at engagement end. General-value extensions graduate to the kit; Lattice-appropriate extensions graduate to Lattice.

---

## D08 — Deployment Model

**Status:** IMPLIED — to be ratified when Chapter 1 scaffold lands.

**Decision (soft):** Vercel as the default deployment target for `/apps/reference` (the kit's reference deployment) and for customer storefronts. Kit code itself remains deployment-target-agnostic in principle (framework is Next.js; that runs anywhere Next.js runs).

**Reasoning:**
- `teligant-headless` deploys on Vercel. `hedfirst-website` deploys on Vercel. Unified deployment target across the three-repo topology simplifies operational mental model, logging, monitoring, and incident response.
- Vercel's Next.js support is first-party: App Router, RSC streaming, middleware, edge runtime, image optimization all work without friction.
- Customer repos inherit the deployment choice but are not *locked* to Vercel — a customer wanting Cloudflare Pages, Netlify, or self-hosted deployment should be able to deploy without kit modifications.

**Factors to resolve:**
- Is the kit expected to support self-hosting (e.g., for customers whose compliance posture precludes Vercel)? This affects middleware posture, image optimization strategy, and some runtime assumptions.
- **Private npm registry choice** (follows from D04 Phase 2): GitHub Packages, private npm org with access control, or self-hosted Verdaccio. Defer until Phase 2 approaches.

---

## D09 — Analytics Posture

**Status:** PENDING

**Factors to resolve:**
- Does the kit ship a typed analytics event interface (customer repos wire their own provider), ship provider adapters (GA4, Mixpanel, Segment), or stay out of analytics entirely?
- **Consent-banner UX** — kit-owned (consistent UX across customers), customer-owned (flexibility), or provider-plug-in (OneTrust, Osano)? Regulatory implications differ per market (US vs. EU vs. state-level).
- **A/B testing infrastructure** — in-kit (consistent discipline), bring-your-own, or per-engagement?

This is flagged in `docs/roadmap.md` §"Three Meta-Questions" as Meta-question 3 (what the kit's opinion is on things Lattice does not cover). It is a real telehealth-commerce concern and the kit will not feel world-class without a clear answer.

**Decision due:** Before Chapter 7's reference surface finalization (since the reference surface demonstrates the kit's analytics posture by example).

---

## D11 — Commerce Backend Source

**Status:** RECOMMENDED — Medusa 2.x as commerce backend alongside `teligant-headless` as regulated clinical backend.

**Recommended direction:** adopt Medusa 2.x. Catalog, cart, checkout, pricing, tax, shipping, inventory, promotions, orders, returns, and fulfillment live in Medusa. `teligant-headless` stays focused on the regulated clinical layer (intake, care requests, provider review, prescription, pharmacy, audit, patient auth). Kit adapters target both backends. Customer deployments provision a Medusa instance alongside the Teligant tenant, on HIPAA-eligible self-host.

**Basis:** three rounds of documentation-based architectural research against Medusa 2.x, captured in [`evaluations/commerce-backend-medusa.md`](./evaluations/commerce-backend-medusa.md). Every hard architectural question tested — auth extension, regulated-item-approval workflow, split fulfillment, auth-before-capture, mixed-cart partial captures, intake-first vs. checkout-first flow topology — has landed on "supported natively by Medusa" with a blessed reference recipe (Okta auth guide, marketplace restaurant-delivery recipe, preorder tutorial) as a template. Market validation: Prescribery + WooCommerce is an incumbent shape in telehealth; adopting Medusa upgrades the commerce leg from WooCommerce to a TypeScript-native composable alternative.

**Alternative considered:** build commerce surfaces in `teligant-headless`. Rejected on scope. Catalog + cart + checkout + pricing + tax + shipping + inventory + orders + promotions + returns + fulfillment is 12–18 months of engineering for a small team before the first customer ships — work that doesn't differentiate. Every hour spent on tax engines and shipping-rate calculations is an hour not sharpening the regulated-clinical moat, which is the actual business.

**Remaining gates to flip to DECIDED (tech viability only):**

1. **Teligant patient-auth audit.** Confirm `teligant-headless` has a patient-auth surface today, or has a near-term tranche planned. Medusa's auth model depends on this upstream via a custom `AbstractAuthModuleProvider` that validates against Teligant. Without a Teligant patient-auth API, the direction does not compose. Estimated: hours, not days.
2. **Stripe manual-capture + multi-capture prototype.** Against a local Medusa dev instance, configure the Stripe provider in `capture_method: manual` and prove the Shape B choreography end-to-end: authorize at checkout → immediate partial capture on non-regulated items → deferred partial capture on regulated items gated by the approval workflow → split fulfillment across two shipping profiles. Estimated: 1–2 days. Closes the last non-commercial tech unknown documented in the evaluation.

Commercial gating (Medusa Cloud BAA availability, per-customer self-host economics) is tracked separately and does not block the tech-viability decision.

**Why this decision is load-bearing:**
- Reshapes D05 (adapter strategy) — two backends vs. one. Now resolved to a mixed strategy (generated for Medusa, hand-authored for Teligant).
- Removes the commerce tranche from `teligant-headless`'s roadmap; prioritizes patient-auth tranche on the Teligant side.
- Determines when real commerce adapters can be written in the kit — day one once the gates pass.
- Adds a new kit-side workspace package `@teligant/medusa-extensions` (custom auth provider, pharmacy fulfillment provider, regulated-approval workflow, approval webhook handler, shipping-profile and capture-method helpers) that ships with the kit and installs into each customer's Medusa instance. Scoped in the evaluation doc's Execution Roadmap If Adopted section.

**Decision due:** Before Chapter 5 (telehealth archetype extensions touching PDP + cart surfaces) and before Chapter 6 (adapters). Chapters 1 through 4 can proceed without waiting on the gates — the direction is stable enough for direction-agnostic foundational work to start.

---

## D10 — Upgrade Path

**Status:** DECIDED (follows directly from D04)

**Decision:** Customer deployments receive kit updates via **opt-in semver npm package upgrades.** Updates are customer-initiated; nothing is pushed automatically. Breaking changes in the kit ship with migration documents per `systems-approach.md`, so a customer upgrading a major version has explicit guidance for what must change.

**Support-tier implication:**
- **Support-contract customers** may have kit upgrades performed for them as part of the retainer (e.g., quarterly upgrade window).
- **No-contract customers** pin whatever kit version was current at their launch and stay there until they contract for an upgrade engagement.

This answers Meta-question 2 from `docs/roadmap.md` ("What is the upgrade path when Lattice or the kit changes?"). Lattice changes propagate to customers through kit releases; the kit is the single upgrade surface customers interact with.

---

## What Lands Next

This document is sufficient to unlock Chapter 1 (scaffold + charter) for the decisions marked DECIDED or IMPLIED. Specifically, scaffolding can begin with:

- Next.js 16 App Router + React 19 + TypeScript (D01)
- pnpm workspaces monorepo with `/packages/kit` + `/apps/reference` (D02)
- Tailwind CSS 4 + CSS custom properties + shadcn/ui primitives (D03)
- Package naming: `@teligant/storefront-kit` (scoped, private publish later) (D04)
- Vercel-ready config (D08)

Before scaffold commits, the IMPLIED decisions (D01, D03, D08) should be formally ratified by writing their concrete configurations (`package.json` engines, `next.config.ts`, `postcss.config.mjs`, `vercel.json` or project settings). The act of writing those configs is the ratification.

The PENDING and RECOMMENDED decisions must be resolved (PENDING → DECIDED, or RECOMMENDED → DECIDED via gate passage) before the chapters that depend on them:
- **D06 Testing strategy** (PENDING) — before Chapter 1 scaffold (CI must have something to run).
- **D11 Commerce backend source** (RECOMMENDED) — before Chapter 5 (telehealth archetypes touching commerce) and before Chapter 6. Gates D05. Flips to DECIDED when the two named gates pass (Teligant patient-auth audit + Stripe manual-capture prototype).
- **D05 Adapter strategy** (RECOMMENDED) — before Chapter 6 (adapters). Flips to DECIDED when D11 does.
- **D09 Analytics posture** (PENDING) — before Chapter 7 reference surface finalization.

---

## Revision History

- **2026-04-20** — Initial draft. D02 (repo shape), D04 (customer instantiation mechanism), D07 (governance model), D10 (upgrade path) decided. D01, D03, D08 marked IMPLIED. D05, D06, D09 marked PENDING.
- **2026-04-20** — D11 (commerce backend source) added as PENDING under active evaluation; see `evaluations/commerce-backend-medusa.md`. D05 reshaped to reflect potential two-backend adapter surface.
- **2026-04-20** — D11 advanced from PENDING to RECOMMENDED (Medusa 2.x as commerce backend) after three rounds of architectural research against Medusa 2.x documentation. Remaining gates explicitly named: Teligant patient-auth audit + Stripe manual-capture / multi-capture prototype. D05 advanced concurrently to RECOMMENDED, resolved to a two-backend adapter shape (generated SDK for Medusa commerce, hand-authored typed adapters for Teligant clinical). New status value **RECOMMENDED** introduced to the status vocabulary for directional lean-in with explicit remaining gates. See `evaluations/commerce-backend-medusa.md` for the research basis and Execution Roadmap If Adopted section for sequencing.
