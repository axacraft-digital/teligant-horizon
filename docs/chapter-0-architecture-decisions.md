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
| D01 | Framework | PENDING | Next.js remains likely, but must be re-ratified for Horizon's new role |
| D02 | Repo shape | RECOMMENDED | Monorepo with `/packages/kit` and `/apps/reference` |
| D03 | Styling model | RECOMMENDED | Lattice tokens as CSS custom properties; implementation choice pending scaffold |
| D04 | Customer instantiation mechanism | PENDING | Package-consumer vs starter-template vs hybrid must be reset |
| D05 | Adapter strategy | RECOMMENDED | Hand-authored typed Teligant adapters with real + mock implementations |
| D06 | Testing strategy | PENDING | Unit, component, visual, adapter, and browser smoke coverage to scope |
| D07 | Governance model | DECIDED | Lattice = design authority; Headless authority stack = regulated workflow authority; AGENTS/CLAUDE = repo operations |
| D08 | Deployment model | PENDING | Customer-owned deployment required; default target not locked |
| D09 | Analytics / consent posture | PENDING | Customer-owned analytics likely; foundation hooks TBD |
| D10 | Upgrade path | PENDING | Semver package updates vs starter-template migrations TBD |
| D11 | Commerce backend source | SUPERSEDED | Horizon does not assume an external commerce backend; customer-side commerce remains customer-owned unless a later authority says otherwise |
| D12 | Content model | PENDING | Content objects / files / CMS adapter posture TBD |

---

## D01 — Framework

**Status:** PENDING

**Likely direction:** Next.js with React and TypeScript, aligned with sibling Teligant projects.

**Why not decided yet:** The reset changes Horizon's purpose. Before scaffold lands, confirm whether the foundation should optimize for full Next.js apps, a package consumed by Next.js apps, or a starter-template shape that can later support more than one runtime.

**Decision due:** Before Chapter 1 scaffold.

---

## D02 — Repo Shape

**Status:** RECOMMENDED

**Recommended direction:** Monorepo.

```txt
teligant-horizon/
├── apps/
│   └── reference/        # Brand-neutral reference storefront
├── packages/
│   └── kit/              # Reusable primitives, archetypes, adapters, and types
├── docs/
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

**Reasoning:**

- Separates reusable foundation code from one reference consumption.
- Keeps customer-neutral code out of customer-specific projects.
- Gives the team a stable internal demo surface.

**Decision due:** Before Chapter 1 scaffold.

---

## D03 — Styling Model

**Status:** RECOMMENDED

**Recommended direction:** Lattice tokens as CSS custom properties, consumed by components and utility styles.

**Locked constraints:**

- Lattice owns token semantics.
- Customer skins override tokens and content, not component internals.
- The foundation must support multiple customer skins without rewriting archetypes.

**Open implementation question:** Tailwind, CSS modules, or a hybrid. The choice should optimize for Lattice expression, performance, and downstream customer ergonomics.

**Decision due:** Before Chapter 1 scaffold and Chapter 2 token implementation.

---

## D04 — Customer Instantiation Mechanism

**Status:** PENDING

**Options:**

| Option | Description | Tradeoff |
|--------|-------------|----------|
| Package-consumer | Customer repos consume a private package from this repo | Clean upgrade path; requires package API discipline |
| Starter-template | Customer repos begin by copying a template app | Fast and concrete; upgrades become migration work |
| Hybrid | Package for core kit + starter template for app composition | More moving pieces; likely best long-term |

**Decision due:** Before Chapter 8 customer-instantiation work.

---

## D05 — Adapter Strategy

**Status:** RECOMMENDED

**Recommended direction:** Hand-authored typed adapters to `teligant-headless`.

**Adapter rules:**

- Components do not call `teligant-headless` directly.
- Secret-bearing calls run server-side.
- Types reflect authoritative or explicitly planned Headless contracts.
- Real adapters are used for shipped backend surfaces.
- Mock adapters are allowed for planned surfaces when clearly labeled and contract-shaped.

**Initial adapter surfaces:**

- intake-session creation
- hosted-intake handoff
- care-request status lookup where authorized
- Branch A commerce handoff when packetized
- payment attestation and capture eligibility when packetized

**Decision due:** Before Chapter 6.

---

## D06 — Testing Strategy

**Status:** PENDING

**Expected coverage:**

- unit tests for token utilities and adapter serialization
- component tests for primitives
- visual regression for archetypes
- adapter tests for request shape, errors, idempotency, and PHI minimization
- browser smoke tests against the reference storefront

**Decision due:** Before Chapter 1 scaffold so CI has meaningful commands.

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

**Status:** PENDING

**Constraint:** Customer storefronts deploy to customer-owned infrastructure and customer-owned domains.

**Open questions:**

- Default target for reference app.
- Whether customer deployments are optimized for Vercel or deployment-agnostic.
- How server-only adapter credentials are configured per customer.
- Whether self-hosting support is required.

**Decision due:** Before Chapter 1 scaffold.

---

## D09 — Analytics / Consent Posture

**Status:** PENDING

**Open questions:**

- Does Horizon provide typed analytics hooks or stay out of analytics entirely?
- Does Horizon include consent-banner primitives?
- How do customer-owned analytics avoid PHI leakage?
- Which events are safe for storefront analytics versus regulated audit?

**Decision due:** Before the reference storefront is considered complete.

---

## D10 — Upgrade Path

**Status:** PENDING

**Open questions:**

- If package-consumer: semver policy, private registry, migration docs.
- If starter-template: migration cadence and support policy.
- If hybrid: what belongs in the package versus the starter app.

**Decision due:** Before first customer instantiation.

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

**Status:** PENDING

**Open questions:**

- File-based content objects, CMS adapter hooks, or customer-repo-owned content modules?
- How are page compositions represented?
- How are customer copy, imagery, legal disclaimers, and product presentation versioned?
- What content can safely appear in the storefront without drifting into regulated workflow?

**Decision due:** Before Chapter 7 reference storefront content is finalized.

---

## What Lands Next

Before application code lands:

1. Ratify D01, D02, D03, D06, and D08 enough to scaffold.
2. Decide whether D04 starts as package-consumer, starter-template, or hybrid.
3. Keep D05 scoped to typed Teligant adapters.
4. Leave D09, D10, and D12 open only if scaffold work does not depend on them.

## Amendment Log

- **2026-05-06** — Reset D11 to SUPERSEDED and removed external commerce-backend assumptions. Reframed Horizon as storefront code foundation for customer-owned custom storefront projects that integrate with `teligant-headless`.
