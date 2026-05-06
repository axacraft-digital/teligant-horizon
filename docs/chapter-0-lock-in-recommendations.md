# Chapter 0 Lock-In Recommendations

**Status:** Draft Recommendation — pending founder ratification
**Doc Class:** Decision Memo (input to `docs/chapter-0-architecture-decisions.md`)
**Scope:** Recommended resolution for the open Chapter 0 entries that block Chapter 1 (scaffold)
**Canonical Authority:** Not implementation authority. Each recommendation becomes authority only when copied into `docs/chapter-0-architecture-decisions.md` with status `DECIDED` and the corresponding entry's Amendment Log line.
**Author:** `$SeniorPrincipalOfficeCTOHorizon`
**Created:** 2026-05-06

---

## Purpose

Chapter 0 is the gate before Chapter 1 (scaffold). Code cannot land while load-bearing entries sit at `PENDING`, and `RECOMMENDED` is direction, not authority (per `docs/agents/senior-principal-engineer-office-of-the-cto-agent.md` → Chapter 0 Authority Rule).

This memo gives a CTO-office recommendation for each open entry, separates the **Chapter 1 blockers** (D01, D02, D03, D04, D06, D08) from the **deferrable** entries (D09, D10, D12), and names the Decision Needed for each.

Already-settled entries (D05 RECOMMENDED, D07 DECIDED, D11 SUPERSEDED) are referenced only where they constrain an open decision.

## Reading order before ratification

1. `AGENTS.md` — storefront product boundary and non-negotiables.
2. `CLAUDE.md` — operating rules, authority model, hard rules.
3. `docs/chapter-0-architecture-decisions.md` — current decision registry (entries to amend).
4. `/Users/kellysmith/Projects/teligant-headless/docs/architecture/tech-stack.md` — sibling repo's stack (Node 24, npm workspaces, Next.js 16, Tailwind v4, Vitest, Vercel). Cross-repo coherence is a first-class input below.
5. `/Users/kellysmith/Projects/lattice-design-system/SYSTEM-MAP.md` — Lattice authority surfaces this foundation must express in code.

---

## Executive Answer

Lock D01 (Next.js 16), D02 (monorepo with `apps/reference` + `packages/kit`), D03 (Lattice tokens as CSS custom properties + Tailwind v4), D04 (hybrid: package-consumer kit + starter-template app), D06 (Vitest + Testing Library + Playwright + axe + a contract-shape adapter test layer), and D08 (Vercel-default but deployment-agnostic at the kit boundary) as `DECIDED`. Leave D09 (analytics/consent), D10 (upgrade path), and D12 (content model) at explicit `PENDING` with named due dates so Chapter 1 is not blocked.

Confidence: **High** for D01, D02, D03, D06, D08. **Medium-high** for D04 (hybrid is the right shape; the package/template split needs a small follow-up sketch). **Defer** D09, D10, D12 deliberately — none are scaffold-load-bearing.

---

## Cross-Cutting Assumptions

These assumptions span every entry below. If one breaks, several recommendations move.

1. **Cross-repo coherence is high-value.** `teligant-headless` is on Node 24, npm workspaces, Next.js 16, Tailwind v4, Vitest, and Vercel Fluid Compute. Horizon picking the same stack reduces context-switching cost, lets typed adapter packages share toolchain, and keeps shared contributor mental models aligned.
2. **Lattice already constrains the styling layer.** Lattice specifies OKLCH-based color with runtime variable logic, fluid type, semantic tokens, density modes, surfaces, and motion. Whatever styling implementation we pick must express runtime CSS custom properties cleanly. That eliminates pure CSS-in-JS approaches that bake values at build time.
3. **The first customer is the forcing function.** Chapter 10 is the deadline that matters. Decisions should optimize for foundation→customer-project leverage by Chapter 12, not for theoretical completeness.
4. **Customer-owned deployment is non-negotiable** (`AGENTS.md` → Customer-Owned Surface). The foundation must not couple to a single deploy target in a way that prevents a customer from deploying to their own infrastructure.
5. **Adapter contracts are owned by `teligant-headless`** (D05, governance D07). The storefront stack choice cannot drift the adapter contract or move regulated workflow into storefront code.

If any of these flips — for example, if the first customer mandates a non-Vercel host, or if a future Headless contract requires React Server Components in a way the kit cannot express — the corresponding decisions below should be revisited.

---

## D01 — Framework

**Recommendation:** Lock Next.js 16 + React + TypeScript on Node 24 LTS with npm workspaces. Status → `DECIDED`.

**Why now:** Three options were on the table — full Next.js app foundation, package consumed by Next.js apps, or a starter template. The hybrid (D04) lets us have the kit be runtime-agnostic-leaning (React + TS, no Next-only imports in primitives) while the reference app and the customer starter are Next 16 apps. That gets the leverage of Next where it matters (App Router, server components, server actions for adapter calls, route conventions, image and font primitives) without forcing every primitive to import from `next/*`.

**Locked constraints:**

- Node 24 LTS (matches `teligant-headless`).
- npm workspaces (matches `teligant-headless`).
- TypeScript-first with narrow explicit types (already in `AGENTS.md` → Coding Preferences).
- Next.js 16 in `apps/reference` and in any starter template emitted from this foundation.
- `packages/kit` primitives may use React + TS only. Next-specific helpers (image, link, route helpers, server actions) live in a separate sub-export (e.g., `packages/kit/next` or a `kit-next` package) so a future non-Next surface is not blocked.

**Tradeoffs considered:**

| Option | Foundation debt | First-customer speed | Cross-repo coherence |
|---|---|---|---|
| Full Next.js app foundation | Couples kit to Next | Fastest reference app | High |
| Package consumed by Next.js apps | Cleanest boundary | Slower (no app shell) | High |
| Starter template only | Migration burden later | Fast first customer | High |
| **Hybrid (recommended)** | Slightly more discipline | Fast | High |

**Risks (top 3):**

- *Next-only primitives leak into kit core.* Mitigation: lint rule or build-time check that `packages/kit/src/**` does not import from `next/*`. Owner: scaffold author in Chapter 1.
- *Next 16 churn.* Probability medium, impact low — Headless is on the same version. Mitigation: pin Next major and update in lockstep with Headless.
- *RSC ergonomics for typed adapters.* Probability low, impact medium. Server-only adapters work cleanly with server components and server actions. Mitigation: adapter exports a clear server-only entry point.

**Decision Needed:** Founder ratifies "Next.js 16 + React + TypeScript on Node 24 LTS, with kit primitives runtime-agnostic at the React layer and Next-specific helpers in a separate sub-export." Captured as a Chapter 0 D01 amendment.

---

## D02 — Repo Shape

**Recommendation:** Lock the monorepo shape from the current `RECOMMENDED` direction. Status → `DECIDED`.

**Locked structure:**

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

**Why now:** No new evidence has emerged against the monorepo recommendation in Chapter 0 D02. Cross-repo coherence reinforces it (Headless is also a small monorepo with `apps/*` + `packages/*`). The hybrid instantiation mechanism in D04 needs both surfaces, which forecloses the "one app, no packages" alternative.

**Locked constraints:**

- One monorepo root.
- One `packages/kit` to start. Resist splitting prematurely; promote sub-packages only when there is a real consumer that needs the smaller surface.
- One `apps/reference` to start. Customer-specific reference content does not live here (per Customer Instantiation Discipline).
- `apps/starter-template/` may be added later under D04 follow-up; it is not required for Chapter 1 scaffold.

**Risks (top 3):**

- *Premature package splitting.* Probability medium, impact medium. Mitigation: explicit "one kit package" rule in `AGENTS.md` until a real second consumer appears.
- *Reference app drift into customer-specific content.* Probability medium, impact high (would break the foundation→customer-project boundary). Mitigation: reference content reviewed against Customer Instantiation Discipline at every chapter exit.
- *Starter template duplicating kit surface area.* Probability medium, impact medium. Addressed in D04 follow-up.

**Decision Needed:** Founder ratifies the monorepo shape exactly as drawn above for Chapter 1 scaffold.

---

## D03 — Styling Model

**Recommendation:** Lock Lattice tokens as runtime CSS custom properties consumed by **Tailwind v4** utility classes, with semantic Tailwind theme bindings that point at the Lattice variables. Status → `DECIDED`.

**Why now:** Three implementation paths were open: Tailwind, CSS Modules, or hybrid. The Lattice authority makes the choice for us — Lattice is built on OKLCH variables and runtime variable logic. Whatever we pick has to express CSS custom properties at runtime. Tailwind v4's CSS-first config and `@theme` directive consume CSS variables natively, which means we can wire Lattice → Tailwind theme tokens once and use utilities everywhere without bypassing semantic tokens.

`teligant-headless` already uses Tailwind v4 in its admin/intake surfaces, so cross-repo contributors and any shared admin-adjacent surfaces share the same model. CSS-in-JS is rejected because it tends to bake values at build time and fights runtime variable swapping (which is how skin override works in Lattice). CSS Modules alone is rejected because it does not compose well with the dense semantic-token usage that Lattice archetypes require.

**Locked constraints:**

- Lattice tokens are emitted as CSS custom properties at the document root and (for density / theming) at scoped surfaces.
- Tailwind v4 `@theme` (or equivalent) maps semantic tokens to Tailwind classes. Components consume semantic Tailwind classes, never raw OKLCH values.
- Customer skins override CSS variables, not component internals (already in D03 `RECOMMENDED`).
- A lint rule or convention forbids hardcoded color, spacing, or font-size values inside `packages/kit/src/**`. Tokens only.
- No CSS-in-JS runtime libraries (emotion, styled-components, vanilla-extract). PostCSS + Tailwind only.

**Risks (top 3):**

- *Tailwind class bloat in archetypes.* Probability medium, impact low. Mitigation: archetypes compose primitives; primitives encapsulate class lists.
- *Semantic-token discipline drift.* Probability medium, impact high (would silently break Lattice authority). Mitigation: lint rule for raw values; archetype review pass at chapter exit.
- *Tailwind v4 config drift between Horizon and Headless.* Probability low, impact medium. Mitigation: keep theme generation rules close enough that contributors can move between repos without re-learning conventions.

**Decision Needed:** Founder ratifies "Lattice CSS variables + Tailwind v4 with semantic theme bindings; no CSS-in-JS" for Chapter 1 scaffold and Chapter 2 token implementation.

---

## D04 — Customer Instantiation Mechanism

**Recommendation:** Lock the **hybrid** mechanism. Status → `DECIDED`.

**Shape:**

- **Package side:** `packages/kit` is published privately (private npm package, scoped name like `@teligant/horizon-kit` or similar). Customers consume it as a versioned dependency. This carries primitives, archetypes, adapters, types, tokens, and Lattice expression.
- **Template side:** A starter template (initially `apps/reference` and later a dedicated `apps/starter-template` or a separate template repo) seeds the customer project's app shell, route composition, deployment config, and content scaffolding. The template depends on the kit package.
- **Customer project layout:** customer-owned repo, customer-owned domain, customer-owned deployment. Customer skin (tokens overrides + content + imagery + copy) lives in the customer project, not in the foundation.

**Why now:** The three alternatives map cleanly:

| Option | Upgrade leverage | First-customer speed | Foundation debt |
|---|---|---|---|
| Package-consumer only | High (semver) | Slow (no shell) | Low |
| Starter-template only | Low (manual migration) | Fast | High over time |
| **Hybrid (recommended)** | **High (kit) + tolerable (template)** | **Fast** | **Manageable** |

The hybrid resolves the central tension: the kit gets the upgrade-path leverage of a versioned package (D10 territory), and the template gets the first-customer speed of a copy-and-customize starting point. The foundation→customer-project boundary stays clean because customer-specific code never lands in the kit.

**Locked constraints:**

- Kit is the sole upgrade surface. Bug fixes and archetype improvements ship through the kit package, not through template re-templating.
- Template owns app-shell, route layout, deployment config, and content scaffolding only. The template imports the kit; it does not re-export kit internals.
- Customer projects own brand expression, content, copy, imagery, domain, deployment, and analytics. None of that lives in the kit or the template.
- A customer project is, by construction, a downstream consumer of a specific kit version. Breaking changes follow D10 once D10 is locked.

**Open follow-up (does not block Chapter 1):**

- Whether the starter template lives in this repo (as `apps/starter-template`) or in a sibling repo (`teligant-horizon-starter`). Recommend in-repo until there is a real reason to split.
- Private registry choice for the kit package. Recommend deferring to Chapter 1 scaffold concretely; npm with a private scope is the default unless infra constraints say otherwise.

**Risks (top 3):**

- *Starter template absorbing logic that should be in the kit.* Probability medium, impact high. Mitigation: explicit Customer Instantiation Discipline review at each chapter exit; the template is a thin shell, not a sibling kit.
- *Customer projects pinning to old kit versions.* Probability high over time, impact medium. Mitigation: D10 (deferred) plus migration notes per breaking change.
- *Kit API surface ballooning to keep templates simple.* Probability medium, impact medium. Mitigation: archetype-level abstractions, not component-level micro-APIs.

**Decision Needed:** Founder ratifies the hybrid as `DECIDED`. The starter-template location and registry choice are deferred to Chapter 1 scaffold mechanics, not blocking.

---

## D06 — Testing Strategy

**Recommendation:** Lock a five-layer testing stack. Status → `DECIDED`.

**Stack:**

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

Visual regression is **deferred** to Chapter 4/5 (archetype-heavy chapters). It is not scaffold-load-bearing and Playwright snapshots will likely cover most of the value.

**Why now:** Vitest matches `teligant-headless`. Testing Library is the React-component standard. axe is the lowest-friction a11y net for `AGENTS.md` accessibility expectations. msw lets adapter tests assert against the documented Headless contract shape without spinning up a real backend, and the same mocks can be used in storybook-style preview later. Playwright is the cleanest browser-smoke choice and is already broadly familiar.

**Locked constraints:**

- Adapter tests must assert *both* request shape and response handling, including error envelope normalization, idempotency keys where relevant, and PHI minimization (no PHI fields appearing in storefront-rendered surfaces).
- Mock adapters (per D05) must share their response fixtures with the contract test layer, so mock drift from real Headless surfaces is caught in tests, not in production.
- Visual regression is deferred but not forbidden — Chapter 4/5 may add it without revisiting Chapter 0.

**Risks (top 3):**

- *Slow CI from Playwright.* Probability medium, impact medium. Mitigation: unit and component lane runs on every commit; e2e lane gates only PRs to `main`.
- *Adapter contract tests drifting from Headless reality.* Probability medium, impact high. Mitigation: fixtures generated from or cross-checked against Headless contract docs; CTO sign-off on adapter spec changes per Headless Seam Discipline Rule.
- *axe noise.* Probability medium, impact low. Mitigation: scoped axe rules per archetype; document accepted false positives if any.

**Decision Needed:** Founder ratifies the five-layer stack and the scaffold-time command set above. Visual regression deferral is explicit.

---

## D08 — Deployment Model

**Recommendation:** Lock **Vercel as the default deploy target with a deployment-agnostic kit boundary**. Status → `DECIDED`.

**Shape:**

- The reference app and the starter template default to Vercel deployment. CI examples and runbooks target Vercel first.
- The kit package itself imports nothing Vercel-specific. Server-only adapter helpers use Web standard APIs (Request/Response, fetch) that work on Vercel, Cloudflare Workers, Node servers, and AWS Lambda alike.
- Customer storefronts deploy to **customer-owned infrastructure**. Vercel is the recommended default; it is not required.
- Server-only adapter credentials are configured through environment variables documented in the customer onboarding runbook (Chapter 9). Browser bundles never carry tenant credentials.

**Why now:** Three things constrain this. First, `AGENTS.md` non-negotiables require customer-owned deployment. Second, `teligant-headless` runs on Vercel Fluid Compute, so a Vercel-default Horizon keeps cross-repo operational knowledge aligned. Third, locking deployment-agnostic at the *kit* boundary preserves the option for a customer with platform constraints (regulated hosting, in-house Kubernetes, Cloudflare Workers) without forking the foundation.

**Locked constraints:**

- Reference app: Vercel by default; documented `next build` works without Vercel-only APIs.
- Kit: no imports from `@vercel/*` or platform-specific runtimes in `packages/kit/src/**`.
- Server-only credential handling: environment variables, never browser bundles. Adapter exports a server-only sub-entry that fails fast if imported into a client bundle.
- Self-hosting support is **not** a Chapter 0 commitment. It is allowed but not required; revisit if a customer requires it.

**Risks (top 3):**

- *Vercel-only patterns leaking into the kit.* Probability medium, impact high (breaks deployment-agnostic posture). Mitigation: ESLint rule or build check; CTO review on any kit change that adds runtime helpers.
- *First customer on a non-Vercel host.* Probability low-medium, impact medium. Mitigation: kit boundary is already deployment-agnostic; customer-specific deployment work absorbs the cost.
- *Credential leakage via misconfigured server/client boundary.* Probability medium, impact very high. Mitigation: server-only entry point + runtime guard + adapter test layer assertion that browser bundles do not include credential code.

**Decision Needed:** Founder ratifies "Vercel default for reference app and starter template; kit boundary is deployment-agnostic; customer storefronts deploy to customer-owned infrastructure" as `DECIDED`.

---

## Deferrable: D09, D10, D12

These three are **not scaffold-load-bearing** and should remain explicitly `PENDING` with named due dates. Listing them so the Chapter 0 doc can record the deferral cleanly.

### D09 — Analytics / Consent Posture

**Recommendation:** Stay `PENDING`. Due before Chapter 7 (reference storefront) is considered complete.

**Why deferrable:** No scaffold code depends on this. The kit can ship without analytics hooks; Chapter 7 will reveal whether typed analytics hooks, a consent banner primitive, or staying out of analytics entirely is the right posture for customer projects.

**Guardrail until decided:** No analytics SDK imports in the kit. No PHI in any future analytics payload (already in `AGENTS.md`).

### D10 — Upgrade Path

**Recommendation:** Stay `PENDING`. Due before first customer instantiation (Chapter 10).

**Why deferrable:** Chapter 1 through Chapter 6 will land on a fast-iteration foundation where breaking changes are expected. Locking semver discipline before there is a stable kit surface area would be premature.

**Provisional guardrail:** Until D10 is locked, treat the kit as `0.x` — breaking changes allowed with a migration note in CHANGELOG. When D04's hybrid template work begins, that is the trigger to lock D10.

### D12 — Content Model

**Recommendation:** Stay `PENDING`. Due before Chapter 7 reference storefront content is finalized.

**Why deferrable:** The content model interacts with D04 (hybrid) and Chapter 8 (customer skin + content model). Trying to lock it now risks baking in assumptions that customer projects will have to fight. Defer until at least one archetype set has been built and the shape of "content slot" vs "page composition" is concrete from real archetype usage.

**Provisional guardrail:** No CMS adapter or runtime CMS dependency is added to the kit until D12 is locked.

---

## Tradeoff Table (Chapter 1 Blockers Combined)

| Decision | Scope impact | Delivery date impact | Foundation debt impact | Customer-deployment impact | Compliance / regulated-seam impact | Adapter forward-compatibility |
|---|---|---|---|---|---|---|
| D01 Next 16 + Node 24 | Locks framework | Unblocks Ch 1 | Low (matches Headless) | Vercel-default, agnostic kit | None directly | High (Next + RSC works with server adapters) |
| D02 Monorepo as drawn | Locks repo shape | Unblocks Ch 1 | Low | None | None | Neutral |
| D03 Lattice + Tailwind v4 | Locks styling | Unblocks Ch 2 | Low (matches Lattice authority) | None | None | Neutral |
| D04 Hybrid instantiation | Locks delivery model | Unblocks Ch 8 + Ch 9 | Medium (template discipline) | Customer-owned preserved | None | Neutral |
| D06 Vitest+RTL+axe+msw+Playwright | Locks test stack | Unblocks Ch 1 CI | Low (matches Headless) | None | Adapter PHI test layer reduces compliance risk | High (mock parity tests) |
| D08 Vercel-default, agnostic kit | Locks deploy posture | Unblocks Ch 7 deploy | Low if discipline holds | Customer-owned preserved | Server-only credential rule | Neutral |

---

## Risk Register (Top 3 Across All Recommendations)

1. **Discipline drift in the kit** — Next-only, Vercel-only, or raw-value styling leaks into `packages/kit/src/**`. Probability: medium. Impact: high (breaks D01, D03, D08 simultaneously). Mitigation: lint rules in Chapter 1 scaffold + CTO review on any kit-runtime change. Owner: scaffold author + this agent.
2. **Adapter contract drift from `teligant-headless`** — mock adapters or kit components encode an obsolete contract shape. Probability: medium. Impact: high (foundation-wide regressions when Headless ships). Mitigation: D06 contract test layer + Headless Seam Discipline Rule sign-off on adapter changes. Owner: adapter author + this agent in sign-off mode.
3. **Customer-specific logic absorbed into the kit** — pressure from first-customer launch (Chapter 10) pushes brand- or workflow-specific code into reusable packages. Probability: medium-high under deadline. Impact: very high (foundation fails to leverage to second customer). Mitigation: Customer Instantiation Discipline Rule applied at every chapter exit; explicit promotion-back rule in `AGENTS.md`. Owner: this agent + founder.

---

## Recommendation

Lock all six Chapter 1 blockers as drawn (D01, D02, D03, D04, D06, D08). Defer D09, D10, D12 with explicit due dates so Chapter 0 stops drifting.

**Confidence:** High on D01, D02, D03, D06, D08. Medium-high on D04 (the package/template split has follow-up mechanics that are not blocking but should be sketched during Chapter 1 scaffold).

**Why now:** Every additional week Chapter 0 stays at `PENDING` is a week Chapter 1 cannot start, which compounds into the first-customer launch date. None of the deferrable entries (D09, D10, D12) require a scaffold to land. None of the blockers depend on information we do not have.

---

## Decision Needed (Today)

The founder should ratify, individually, the six blocker recommendations. Each ratification is captured as an Amendment Log line in `docs/chapter-0-architecture-decisions.md`:

1. **D01 → DECIDED:** Next.js 16 + React + TypeScript + Node 24 LTS + npm workspaces. Kit primitives runtime-agnostic at the React layer; Next-specific helpers in a separate sub-export.
2. **D02 → DECIDED:** Monorepo with `apps/reference` + `packages/kit` exactly as drawn.
3. **D03 → DECIDED:** Lattice tokens as runtime CSS custom properties + Tailwind v4 with semantic theme bindings. No CSS-in-JS.
4. **D04 → DECIDED:** Hybrid — published kit package + starter template. Customer projects own brand, content, deployment, domain.
5. **D06 → DECIDED:** Vitest + React Testing Library + axe + msw-backed adapter contract tests + Playwright e2e. Visual regression deferred to Chapter 4/5.
6. **D08 → DECIDED:** Vercel default for reference and starter template; kit boundary deployment-agnostic; customer storefronts deploy to customer-owned infrastructure.

The founder should also explicitly affirm the deferrals:

7. **D09 → remains PENDING.** Due before Chapter 7 exit.
8. **D10 → remains PENDING.** Due before Chapter 10 (first customer instantiation).
9. **D12 → remains PENDING.** Due before Chapter 7 reference storefront content is finalized.

Once ratified, the next packet boundary is **Chapter 1 — Scaffold + Charter**: workspace scaffold, package/app boundaries, lint/format/test/build commands, baseline CI, and a minimal reference app that renders. No Lattice token implementation, no archetypes, no adapters in Chapter 1 — those start in Chapter 2 / Chapter 6.
