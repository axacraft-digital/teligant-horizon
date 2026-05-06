# Teligant Horizon Roadmap

**Status:** Planning Draft  
**Doc Class:** Planning Document  
**Scope:** Roadmap for turning `teligant-horizon` into the storefront code foundation for customer-owned Teligant storefronts  
**Canonical Authority:** Not implementation authority — a planning artifact that frames the work  
**Created:** 2026-04-17  
**Reset:** 2026-05-06  

## Purpose

This document is the attack plan for the storefront foundation. It answers:

- what this foundation needs to become
- what gets built in what order
- which decisions must be locked before code lands
- how the foundation produces bespoke customer storefronts without becoming a hosted storefront product

This is a living document. Update it as chapters land, decisions change, or the Headless authority stack moves.

## What Horizon Is

Horizon is **Lattice-in-code + telehealth storefront archetypes + typed Teligant adapters + a customer-instantiation mechanism**.

Everything downstream follows from that definition. If proposed work does not advance one of those four things, it probably does not belong here.

Horizon exists for Scenario 2 in the integration explainer: Teligant scaffolding for a customer-owned storefront. It should also produce clean adapter examples that help Scenario 1 BYO storefront customers integrate with Teligant without adopting the full foundation.

## What Horizon Is Not

- not a hosted storefront builder
- not a CMS
- not a page-builder
- not an admin surface
- not a regulated workflow runtime
- not a payment processor abstraction
- not a pharmacy fulfillment system
- not a broad customer portal

## Structure: Four Parts, Twelve Chapters

Work is organized in four parts. Parts are conceptual; chapters are the scoped execution units.

---

## Part I: Foundations

Brand-neutral, reusable, inherited by every customer storefront.

### Ch 0 — Architecture Decisions

**Status:** Reset required.

Chapter 0 decides the stack before code commits the repo to a posture.

**Decisions to lock:**

- Framework and runtime posture.
- Repo shape.
- Styling model.
- Customer instantiation mechanism.
- Adapter strategy for Teligant Headless.
- Testing strategy.
- Governance model.
- Deployment model.
- Analytics and consent posture.
- Content model.
- Package / release strategy.

**Deliverable:** `docs/chapter-0-architecture-decisions.md`.

### Ch 1 — Scaffold + Charter

Create the repo skeleton from Chapter 0 decisions.

**Scope:**

- workspace scaffold
- package/app boundaries
- README / AGENTS / CLAUDE alignment
- `.gitignore`, lockfile, runtime config, editor config
- type-check, lint, test, and build commands
- baseline CI if a remote exists
- no customer-specific implementation

**Exit criteria:** fresh clone installs, builds, type-checks, lints, and runs a minimal reference app.

### Ch 2 — Lattice Foundations In Code

Turn Lattice's foundational rules into code.

**Scope:**

- typography system
- spacing ladder
- grid / layout primitives
- color and semantic tokens
- density
- surfaces
- state tokens
- motion rules
- skin override mechanism

**Exit criteria:** a reference page renders Lattice foundations and can swap between at least two fake skins without component rewrites.

### Ch 3 — Lattice Primitives

Implement brand-neutral primitives.

**Scope:**

- buttons
- links
- badges
- cards / surface wrappers where authorized by Lattice
- form fields
- disclosure / accordion primitives
- content containers
- navigation primitives

**Exit criteria:** primitives have typed props, accessibility coverage, responsive behavior, and visual states.

### Ch 4 — Lattice Section Archetypes

Implement reusable Lattice section archetypes as composable storefront sections.

**Scope:**

- hero / statement sections
- trust strips
- section intros
- science / education splits
- ingredient or benefit grids
- proof / stat bands
- testimonial proof
- editorial / manifesto sections
- conversion CTAs
- FAQ / disclosure sections

**Exit criteria:** the reference storefront can compose the full Lattice section set with placeholder content.

---

## Part II: Telehealth Storefront Specialization

Reusable surfaces that Lattice does not cover by itself.

### Ch 5 — Telehealth Archetype Extensions

Telehealth-specific archetypes extend Lattice. They do not fork it.

**Scope:**

- Program / category grid.
- Treatment or product detail page.
- Questionnaire gateway.
- Eligibility / state gate.
- Pharmacy and compliance disclosure.
- How-it-works flow.
- Clinician / provider trust section.
- Safety and contraindication disclosure section.

**Exit criteria:** telehealth archetypes compose with Lattice archetypes without design drift and clearly terminate at the Teligant API / hosted-intake seam.

### Ch 6 — Typed Teligant Adapters

The seam between customer storefronts and `teligant-headless`.

**Scope:**

- typed adapter client for shipped Headless API surfaces
- mock adapters for planned Headless surfaces
- adapter configuration per tenant/customer project
- error envelope normalization
- idempotency-key support where relevant
- server-only credential handling
- non-PHI event and status display helpers

**Initial adapter candidates:**

- intake-session creation
- hosted-intake handoff URL handling
- care-request status lookup where authorized
- Branch A commerce handoff when packetized
- payment-attestation / capture-eligibility helpers when packetized
- webhook event display examples for customer-owned status surfaces

**Exit criteria:** the reference storefront can start a Teligant intake flow against real shipped endpoints and can exercise planned endpoints through clearly labeled mocks.

---

## Part III: Customer Instantiation

The machinery that turns the foundation into repeatable customer delivery.

### Ch 7 — Reference Storefront

The canonical non-customer implementation.

**Surfaces:**

- homepage
- program/category page
- treatment/product detail page
- how-it-works page
- FAQ/disclosure page
- questionnaire gateway
- post-handoff status affordance where authorized

**Purpose:**

- proves the foundation works as a cohesive whole
- demonstrates Lattice + telehealth archetypes
- gives prospects a previewable artifact
- gives downstream customer projects a comparison target

**Exit criteria:** deployed to an internal preview environment with accessibility and performance budgets.

### Ch 8 — Customer Skin + Content Model

Prove the foundation can become a different storefront without code drift.

**Scope:**

- skin file format
- token override rules
- content object model
- imagery / asset conventions
- voice and copy slots
- route / page composition config
- fake second brand proof

**Exit criteria:** a fake brand produces a materially different storefront by changing skin/content/config, not foundation code.

### Ch 9 — Customer Onboarding Runbook

The repeatable delivery playbook.

**Scope:**

- how discovery/design artifacts become a Lattice skin
- how page/archetype selection happens
- how content is installed
- how adapters are configured
- how customer-owned deployment is prepared
- what is handed over to the customer
- what stays internal
- support obligations and scope boundaries

**Exit criteria:** another person can instantiate a fake customer storefront by following only the runbook.

---

## Part IV: First Customer And Hardening

### Ch 10 — First Customer Storefront

Apply the foundation to the first real customer.

**Scope:**

- customer skin
- customer content
- customer page composition
- adapter configuration
- production deployment to customer-owned infrastructure
- launch readiness checklist

**Exit criteria:** first customer storefront launches against real Teligant Headless v1 surfaces for the authorized workflow.

### Ch 11 — Foundation Hardening

Feed first-customer learning back into the foundation.

**Scope:**

- archetype refinements
- adapter ergonomics
- documentation gaps
- accessibility and performance gaps
- instantiation runbook corrections
- migration notes for breaking changes

**Exit criteria:** first-customer-driven improvements are captured, generalized where appropriate, and closed without baking customer-specific assumptions into the foundation.

### Ch 12 — Second Customer

The proof that the foundation creates leverage.

**Exit criteria:** second customer delivery is materially faster and cleaner than the first. If it is not, the foundation failed to productize the work and the model needs revision.

---

## Cross-Cutting Decisions

| Decision | Current posture | Blocks |
|----------|-----------------|--------|
| Framework | Pending reset | Ch 1 |
| Repo shape | Monorepo likely; confirm in Ch 0 | Ch 1 |
| Styling model | Lattice tokens + CSS variables required; implementation choice pending | Ch 1 / Ch 2 |
| Adapter strategy | Typed Teligant adapters; no external commerce backend assumption | Ch 6 |
| Testing strategy | Pending | Ch 1 |
| Customer instantiation mechanism | Package or starter-template shape pending reset | Ch 8 / Ch 9 |
| Analytics / consent | Pending | Ch 7 |
| Content model | Pending | Ch 7 / Ch 8 |

---

## Sequencing Recommendation

1. Reset Chapter 0 and remove stale architecture assumptions.
2. Scaffold the smallest working foundation.
3. Implement Lattice foundations and primitives.
4. Build telehealth archetypes around the customer-to-Teligant seam.
5. Add typed Teligant adapters and mock planned surfaces.
6. Build the reference storefront.
7. Prove skin/content instantiation with a fake brand.
8. Write the customer onboarding runbook.
9. Launch the first customer storefront.
10. Harden the foundation from real delivery.

## Stop Conditions

Stop if roadmap work drifts toward:

- a hosted storefront builder
- a customer-editable page-builder
- regulated workflow in storefront code
- PHI in storefront state
- raw card data handling
- external API contracts invented locally
- customer-specific code in reusable foundation packages
- Branch B checkout implementation without authority
- Lattice token or archetype changes without design authority
