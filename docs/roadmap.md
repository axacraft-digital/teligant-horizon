# Storefront Kit Roadmap

**Status:** Planning Draft
**Doc Class:** Planning Document
**Scope:** The attack plan for building `teligant-headless-storefront` from empty scaffold to first customer launch (Hedfirst) and beyond
**Canonical Authority:** Not implementation authority — a planning artifact that frames the work
**Created:** 2026-04-17

## Purpose

This document is the single-page attack plan for this repository. It answers:

- what this kit needs to become
- in what order
- at what pace given the first customer timeline
- and what meta-questions will quietly determine whether it succeeds

It is a **living** document. Edit it as the work lands. When a chapter is complete, mark it complete. When a decision is made, link the decision doc. When the plan changes, update it here rather than carrying tribal knowledge.

## What The Kit Is

The storefront kit is **an implementation of Lattice, specialized for telehealth commerce, plus a customer-instantiation mechanism**.

Everything downstream follows from that definition. If any proposed work doesn't advance one of those three things (Lattice-in-code, telehealth specialization, or customer instantiation), it probably doesn't belong here.

## Structure: Four Parts, Twelve Chapters

Work is organized in four mental **parts**, each containing several **chapters**. Parts are categories; chapters are the actual scoped work.

---

## Part I: Foundations (Brand-Neutral, Reusable Forever)

The kit's spine. Every customer forever inherits this layer. Changes here are high-leverage and high-risk.

### Ch 0 — Architecture Decisions

**Status:** Pending. No code until this lands.

The most important chapter and the one most easily skipped. Decides the stack before any keystroke commits the repo to a posture.

**Decisions to lock:**

- **Framework.** Next.js 16 is the likely answer (same DNA as `teligant-headless`). Alternatives: Astro (for static marketing sites), Remix, or a bespoke Vite + React setup. The choice has downstream implications for SSR, static export, bundle size, deployment targets.
- **Repo shape.** Monorepo with `packages/kit` + `apps/reference` + `apps/starter`, or single-app scaffold? Recommendation: monorepo — one place for kit code, one place to demo the kit, one place as the per-customer starter template.
- **Styling model.** CSS custom properties + Tailwind v4? Pure CSS modules? Vanilla CSS with PostCSS tooling? The decision affects how Lattice tokens are expressed and consumed.
- **Customer instantiation mechanism.** Fork-the-starter-repo, `npx create-teligant-storefront` generator, or package-consumer-with-customer-downstream-repo? Each has real implications for how skin updates and kit updates flow.
- **Adapter strategy.** Typed SDK generated from headless OpenAPI, or hand-written typed clients? Hand-written is faster now; generated scales better.
- **Testing strategy.** Visual regression? Component unit tests? End-to-end? What's the discipline for archetype changes?
- **Governance model.** Who owns adding a new archetype? Who owns a token ladder change? How does a customer-specific extension get considered for upstream inclusion?
- **Deployment model.** Vercel, Cloudflare, Netlify, self-hosted? Should the kit be deployment-target-agnostic, or optimized for one?
- **Analytics posture.** The kit's opinion on GA, Mixpanel, Segment, consent, and whether the kit ships with hooks or is bring-your-own.

**Deliverable:** `docs/chapter-0-architecture-decisions.md` — a single document that records each decision, the alternatives considered, and the reasoning. The decisions don't need to be perfect. They need to be made, documented, and stable.

### Ch 1 — Scaffold + Charter

Create the repo skeleton. Write the project charter per `systems-approach.md` §8.1.

**Scope:**
- scaffold per Chapter 0 stack choices
- charter doc (what this is, voice, rules, stack, architecture, known gotchas, commands, out-of-scope)
- contributing guide skeleton (even if thin on day one)
- CI basics (type-check, lint, format-check)
- `.gitignore`, lockfile, `.nvmrc`, editor config
- placeholder test harness so CI has something to run

**Exit criteria:** a fresh clone builds, types check, lints clean, and CI is green on an empty repo.

### Ch 2 — Port Lattice Foundations To Code

The pure foundational layer. Turns Lattice spec into CSS/tokens/utilities. Brand-neutral.

**Scope (per Lattice files):**
- Typography — three-voice type system, fluid scale, semantic/visual decoupling as CSS variables and utility classes
- Spacing — behavioral layers (optical, component, layout) as named variables
- Grid — compositional field model, frame modes, allocation archetypes as layout components
- Color — OKLCH primitives, semantic UI tokens, runtime variable logic
- Density — compact, default, relaxed as context-level variables
- Surfaces — page planes, raised layers, muted, dark, overlay logic
- States — disabled, selected, loading, focus, scrim, selection
- Motion — feedback, state change, entrance rules

**Not in scope here:** components, archetypes, customer skins.

**Exit criteria:** a reference HTML file (not a React page — just HTML) renders every Lattice foundation correctly against the defaults. Every Lattice rule expressible in CSS is expressed.

### Ch 3 — Port Lattice Primitives

The applied-system layer. Still brand-neutral.

**Scope:**
- Prose container — long-form content wrapper with reading measure, list behavior, inline links
- Buttons — governed roles, shared control size axis, all required states
- Forms — inputs, labels, fields, validation states aligned to buttons and type roles
- Badges — compact label and tag primitives
- Links — inline, standalone, navigational, inverse families

**Exit criteria:** every Lattice primitive has a component, typed props that match Lattice's editability contracts, and passes accessibility and state coverage.

### Ch 4 — Port Lattice Section Archetypes

All ten Lattice section archetypes as composable layout components.

**Scope:**
1. Hero Statement
2. Trust Strip
3. Section Intro
4. Science Split
5. Ingredient Grid
6. Proof / Stat Band
7. Testimonial Proof
8. Editorial / Manifesto
9. Conversion CTA
10. FAQ / Disclosure

Each takes content props and renders following Lattice's rules. Merchant-editable surfaces are editable via props; design-system decisions are locked.

**Exit criteria:** a test page composes all ten archetypes with placeholder content and visually expresses Lattice's intended character.

---

## Part II: Telehealth Specialization (Reusable Across Telehealth Customers)

The things Lattice doesn't cover because Lattice is general-purpose. Authored once, reused across every telehealth customer forever.

### Ch 5 — Telehealth Archetype Extensions

Archetypes that inherit Lattice's foundational rules and add telehealth semantics. **Not a fork of Lattice. Extensions.**

**Scope:**
- PDP with Questionnaire Gateway — product detail page that terminates at an intake-session start rather than add-to-cart
- Program / Category Grid — launch-category navigation (weight loss, ED, hair loss, HRT, skincare, peptides)
- Eligibility / State Gate — 50-state licensing, age, and condition pre-qualification
- Pharmacy and Compliance Disclosure — regulated-product disclosure surface distinct from FAQ
- How It Works Explainer — linear process explanation (browse → questionnaire → review → prescription → fulfillment)

**Deliverable:** a new `telehealth-archetypes.md` in the kit's docs that formalizes these archetypes in the same structure Lattice uses for its ten. This document may graduate upstream to Lattice as a telehealth supplement.

**Exit criteria:** telehealth archetypes compose with Lattice archetypes on a test page without visual dissonance or rule violations.

### Ch 6 — Typed Adapters (Two Backends) + `@teligant/medusa-extensions`

The seam between the kit and its two backends. Typed, mockable, honest about what's shipped and what's not. Scope reshaped under D11 (commerce backend = Medusa 2.x, RECOMMENDED): the kit's adapter surface now targets two backends, and a new kit-side workspace package carries the regulated-workflow glue that lives in Medusa's extension points.

**Scope (commerce — Medusa, real day one):**
- Generated SDK from Medusa's published OpenAPI spec (e.g., `openapi-typescript` or `orval` against Medusa's OpenAPI). Types regenerated on every build.
- Covers catalog, cart, checkout, pricing, tax, shipping, orders, fulfillment, promotions, returns.

**Scope (clinical — Teligant, real where tranched, mock otherwise):**
- Hand-authored typed modules, one per surface. Mock variants live alongside and are selected via a configurable client.
- Real adapters (shipped headless surfaces): intake session (`POST /v1/intake-sessions`, `GET /s/[session_id]`, `POST /s/[session_id]/complete`), care request status (`GET /v1/care-requests/{id}/status`, `GET /v1/care-requests/status?external_ref=`).
- Mock adapters (un-tranched): patient auth (gating the Medusa custom auth provider — see extensions package below), any additional clinical surfaces Teligant roadmap reveals.
- When a real tranche lands, the mock is retired and the real adapter is wired without re-implementing the consuming component.

**Scope (new workspace package — `@teligant/medusa-extensions`):**

The Medusa extension points the kit owns and ships with customer deployments. Installed into each customer's Medusa instance during build phase.

- **Custom auth provider** — extends `AbstractAuthModuleProvider`; validates credentials / tokens against Teligant's patient-auth API; creates or updates a Medusa `AuthIdentity` with `entity_id = teligant_user_id`.
- **Custom pharmacy fulfillment provider** — extends `AbstractFulfillmentProviderService`; routes regulated-SKU line items (pharmacy shipping profile) to Teligant's pharmacy integration; webhook-completes back to Medusa.
- **Regulated-approval workflow** — Medusa 2.x long-running workflow using the `async: true` step pattern. Two variants: **Shape A fast-path** (approval already in hand from intake; verify currency + release fulfillment) and **Shape B capture-gated** (wait for approval, then `capturePaymentWorkflow.runAsStep` → `createOrderFulfillmentWorkflow`). Compensation on denial cancels the order and clears the auth.
- **Teligant approval webhook handler** — Medusa API route that resumes the approval workflow via `setStepSuccess` / `setStepFailure` keyed to the transaction ID stored in `order.metadata`.
- **Shipping-profile configuration helpers** — pharmacy profile vs. standard profile scaffolding.
- **Shape A / Shape B orchestration presets** — Stripe `capture_method: manual` configuration toggle, mixed-cart partial-capture helpers.

**Exit criteria:** the reference site (Chapter 7) runs end-to-end against a local Medusa instance with the extensions package installed, plus real intake-session / care-request adapters against Teligant (real where tranched, mocked otherwise). Both commerce-flow shapes (A intake-first and B checkout-first-with-auth-before-capture) exercised on the reference surface.

**Dependencies:** flips live when D11 and D05 flip to DECIDED (after the two gates named in D11: Teligant patient-auth audit + Stripe manual-capture prototype). Direction-agnostic scaffolding can begin earlier; adapter authoring waits on the flip.

---

## Part III: Customer Instantiation (The "Running Head Start" Mechanism)

The part that turns the kit from "a thing that renders one demo site" into "a thing that produces bespoke customer websites at a pace that makes the business model work."

### Ch 7 — Reference Surface

The canonical reference implementation. Not a real customer — a brand-neutral or fictional telehealth brand that exercises every archetype end-to-end.

**Surfaces:**
- Homepage (Hero + Trust + Program Grid + Science Split + Proof + Testimonial + Conversion CTA)
- Category / Program page (Program Intro + Product Grid + CTA)
- PDP (Hero + Science Split + Ingredient Grid + Testimonial + PDP Questionnaire Gateway)
- How It Works page
- FAQ page
- About / Editorial page
- Questionnaire flow (real intake-session wiring)
- Status / Care Request polling page

**Purpose:**
- proves the kit works as a cohesive whole
- serves as the "canonical reference implementation" per `systems-approach.md` §4
- becomes the demo artifact for prospects before a customer skin exists
- becomes the comparison surface for future customer instances (if a customer surface diverges from the reference without reason, it's drift)

**Exit criteria:** deployed to an internal preview environment, exercises every archetype, passes accessibility and performance budgets.

### Ch 8 — Customer Instantiation Model Built And Proven

Chapter 0 picked an instantiation mechanism (fork, generator, or package-consumer). This chapter builds it and proves it.

**Scope:**
- whatever tooling the chosen mechanism requires
- a second, fake brand instantiated from the kit (tokens only, not a full engagement) — to prove the mechanism produces a different-looking site without kit code drift
- clear documentation of the instantiation steps

**Exit criteria:** a non-kit-author can take the reference surface, clone it into a new brand, change tokens, change copy, and deploy — following only the documented runbook.

### Ch 9 — Customer Onboarding Runbook

A document that describes the exact steps to onboard a new customer, from design phase output to deployed site.

**Scope:**
- how the design phase's Lattice skin spec maps to token installation
- how archetype selection happens per customer
- how content is populated
- how real adapters get wired as headless tranches land
- what customer-owned repo vs. customer-owned deployment looks like
- what gets handed over to the customer vs. stays internal
- support obligations and scope boundaries

**Scope addition under D11 = Medusa (RECOMMENDED):**
- **Per-customer Medusa instance provisioning.** Infrastructure shape (HIPAA-eligible self-host presumed), database + Redis setup, Stripe Connect wiring (including Shape A auto-capture vs. Shape B `capture_method: manual` per product line), shipping-profile setup (pharmacy vs. standard).
- **`@teligant/medusa-extensions` installation and configuration** into the customer's Medusa instance — custom auth provider pointed at the customer's Teligant tenant, custom pharmacy fulfillment provider pointed at their pharmacy integration, regulated-approval workflow and webhook handler wired.
- **Per-customer catalog configuration** — products, variants, shipping-profile assignment for regulated SKUs, pricing / tax / region configuration.
- **Customer admin handover** — Medusa admin plus Teligant admin; ops staff onboarding across the two UIs.

This is the playbook a delivery person (Dasha, a contractor, or a future hire) follows. Without it, the kit's leverage exists only in the head of the kit author. The Medusa provisioning path is the new repeatable primitive that sharpens the Ch 12 "running head start" claim.

**Exit criteria:** another person can onboard a fake customer (including standing up a Medusa instance with extensions installed and configured) by following only this doc, without needing to ask the kit author for clarification.

---

## Part IV: First Customer And Iteration

### Ch 10 — Hedfirst Instance

The first real application of the kit. Apply the Hedfirst skin. Configure Hedfirst-specific content and archetype selection. Wire real adapters as headless tranches land. Launch.

**Scope:**
- Hedfirst token set applied
- Hedfirst content populated across launch pages
- category structure configured per Hedfirst's launch decisions
- any customer-specific archetype extensions scoped and delivered
- production deployment to Hedfirst-owned infrastructure (`app.hedfirst.com`)
- launch readiness per the `customer-storefront-delivery-model.md` build phase

**Scope addition under D11 = Medusa (RECOMMENDED):**
- Hedfirst Medusa instance provisioned on HIPAA-eligible self-host infrastructure alongside Hedfirst's Teligant tenant
- `@teligant/medusa-extensions` installed and configured against Hedfirst's Teligant patient-auth surface and pharmacy integration
- Hedfirst catalog configured — products, variants, shipping profiles (pharmacy vs. standard) per Hedfirst's product mix
- Shape A / Shape B flow assignment per Hedfirst product line (intake-first for Rx, checkout-first-with-auth-before-capture where applicable)

**Exit criteria:** Hedfirst's launch goes live. End-to-end flow operates against real `teligant-headless` v1 and the Hedfirst Medusa instance. Launch stabilization period begins.

### Ch 11 — Kit Hardening From Hedfirst Learnings

The first real engagement always reveals things the kit got wrong. This chapter feeds those learnings back into the kit via migration docs per `systems-approach.md`.

**Scope:**
- archetype refinements where Hedfirst needed something the kit didn't express cleanly
- adapter ergonomics where the real integration revealed friction
- documentation gaps revealed when other people touched the kit
- performance or accessibility gaps revealed under real traffic and real audit
- instantiation mechanism weaknesses revealed when taking Hedfirst from reference to production

**Scope addition under D11 = Medusa (RECOMMENDED):**
- **Medusa major-upgrade governance.** Minor version churn is insulated by the adapter layer; major versions require re-testing `@teligant/medusa-extensions` (custom providers and workflows) against the new Medusa release. Surface each Medusa major as a migration doc per `systems-approach.md`. Add a regression pass (custom auth provider, pharmacy fulfillment provider, regulated-approval workflow, Shape A/B capture flows) to the kit hardening checklist.
- **Extension-package ergonomics from real customer deployment** — friction in provisioning, configuring, and debugging the extensions package against a real Medusa instance.

**Exit criteria:** every Hedfirst-driven kit improvement is captured in a migration doc, addressed, and closed. The kit is materially better after Hedfirst than before.

### Ch 12 — Second Customer

The real test of the "running head start" claim. Onboard customer #2.

If customer #2 is materially faster and cleaner to onboard than Hedfirst was, the kit has productized the work.

If customer #2 takes as long as Hedfirst did, the kit did not productize anything and the investment model needs to be re-examined.

This is a measurement chapter, not a scope chapter. The specific second customer depends on pipeline.

---

## Pacing Against The Hedfirst Timeline

The 12-week pacing structure below is aspirational and chapter-anchored. The Hedfirst-specific launch date is the forcing function; re-anchor the week numbers against it as the Hedfirst launch timeline firms up.

| Period | Approximate Weeks | Scope |
|--------|-------------------|-------|
| **Foundations** | Week 1-2 | Ch 0 locked. Ch 1 scaffold complete. Ch 2 Lattice foundations in code. Start Ch 3, build 2-3 archetypes from Ch 4 (Hero, Science Split, Conversion CTA) on a brand-neutral skin. Goal: a living aesthetic demo that proves the bones work, ready for Hedfirst skin integration. |
| **Archetypes + adapter kickoff** | Week 3-4 | Finish Ch 3 (primitives). Finish Ch 4 (all 10 Lattice archetypes). Start Ch 5 (telehealth archetypes). Start Ch 6 (adapters — two-backend surface against a local Medusa instance + real Teligant intake-session wiring). |
| **Hedfirst build phase** | Week 5-8 | Finish Ch 5, Ch 6 (including `@teligant/medusa-extensions` package). Complete Ch 7 (reference surface). Ch 8 (instantiation mechanism built and proven). Ch 9 (onboarding runbook). Start Ch 10 (Hedfirst skin applied; Hedfirst Medusa instance provisioned). |
| **Hedfirst launch + stabilize** | Week 9-12 | Finish Ch 10. Ch 11 hardening from launch learnings. |
| **Customer #2** | Week 12+ | Ch 12 tests whether the leverage is real. |

This pacing is aggressive but achievable if Ch 0 decisions are clean and don't get re-litigated mid-build. Most kit projects fail not because any individual chapter is hard but because Chapter 0 decisions drift and every downstream chapter pays the cost of the indecision.

## Three Meta-Questions Above The Chapters

Three questions that the chapters don't answer on their own but will quietly determine whether the kit succeeds:

### 1. Who is the "one team" that builds both halves?

Today: Kelly + agents + Dasha. As deals grow, does it stay in-house, scale through contractors, or require hires? The kit's design choices — ergonomics, docs quality, instantiation model, onboarding runbook depth — should assume **someone who isn't Kelly** will be onboarding customer #3. If the kit requires the author to succeed, it hasn't productized anything.

### 2. What is the upgrade path when Lattice or the kit changes?

Lattice will evolve. The kit will evolve. How do previously-deployed customer sites receive updates? Never (locked at deploy time)? On request (customer pays for updates)? Automatically via package version bumps (customer is on a support plan)? This is a downstream commercial question, but the architecture has to allow whatever answer gets chosen. Best decided early.

### 3. What's the kit's opinion on things Lattice doesn't cover?

Lattice (correctly) does not address:
- SEO structure and conventions
- Accessibility audit bar and compliance posture
- Performance budgets and Core Web Vitals
- Image CDN strategy
- Analytics integration and consent
- Consent banners and privacy UX
- Email marketing integration
- A/B testing infrastructure

These are real telehealth commerce concerns. The kit needs opinions on them or it won't feel world-class. Worth authoring early as part of the charter rather than discovering under customer-delivery pressure.

---

## Open Decisions Tracker

Maintain a simple list of decisions needed but not yet made. Each row links to the chapter or doc that will resolve it.

| Decision | Status | Blocks | Resolution Doc |
|----------|--------|--------|----------------|
| Framework | Implied (Next.js 16) | Ch 1 onward | [`chapter-0-architecture-decisions.md`](./chapter-0-architecture-decisions.md) D01 |
| Repo shape | **Decided** | Ch 1 | [`chapter-0-architecture-decisions.md`](./chapter-0-architecture-decisions.md) D02 |
| Styling model | Implied (Tailwind 4 + CSS custom properties) | Ch 2 | [`chapter-0-architecture-decisions.md`](./chapter-0-architecture-decisions.md) D03 |
| Customer instantiation mechanism | **Decided** (Shape 2: separate customer repos consume kit package) | Ch 8 | [`chapter-0-architecture-decisions.md`](./chapter-0-architecture-decisions.md) D04 |
| Adapter strategy | **Recommended** (two-backend: generated for Medusa, hand-authored for Teligant) | Ch 6 | [`chapter-0-architecture-decisions.md`](./chapter-0-architecture-decisions.md) D05 |
| Testing strategy | Pending | Ch 1 | [`chapter-0-architecture-decisions.md`](./chapter-0-architecture-decisions.md) D06 |
| Governance model for archetype/ladder changes | **Decided** | Always | [`chapter-0-architecture-decisions.md`](./chapter-0-architecture-decisions.md) D07 |
| Deployment model | Implied (Vercel) | Ch 7 | [`chapter-0-architecture-decisions.md`](./chapter-0-architecture-decisions.md) D08 |
| Analytics posture | Pending | Meta-question 3 | [`chapter-0-architecture-decisions.md`](./chapter-0-architecture-decisions.md) D09 |
| Upgrade path for deployed sites | **Decided** (opt-in semver package upgrades) | Meta-question 2 | [`chapter-0-architecture-decisions.md`](./chapter-0-architecture-decisions.md) D10 |
| Commerce backend source | **Recommended** (Medusa 2.x; gated on Teligant patient-auth audit + Stripe manual-capture prototype) | Ch 5, Ch 6, D05 | [`chapter-0-architecture-decisions.md`](./chapter-0-architecture-decisions.md) D11; [`evaluations/commerce-backend-medusa.md`](./evaluations/commerce-backend-medusa.md) |

---

## What This Document Is Not

This is not:

- implementation authority (it describes shape, not contracts)
- a project management plan (the pacing is a framework, not a schedule)
- a commercial commitment (no pricing, no customer commitments)
- a locked sequence (chapters can re-order if evidence justifies; surface the change, don't drift)

It is the **thinking framework** for the kit. Edit it as the work lands. When it's wrong, fix it in place rather than carrying stale context.
