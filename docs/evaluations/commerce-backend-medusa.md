# Commerce Backend Evaluation — Medusa 2.x

**Status:** Open Evaluation — NOT A DECISION
**Doc Class:** Research / Investigation
**Scope:** Evaluates Medusa.js 2.x as the commerce backend for customer storefronts produced by `teligant-headless-storefront`, relative to the default assumption of building commerce surfaces inside `teligant-headless`
**Canonical Authority:** None. This document is not implementation authority. It is research in progress; do not build against its conclusions.
**Created:** 2026-04-20
**Last Updated:** 2026-04-20

## Purpose

Preserve the first-pass research on whether to adopt Medusa (open-source headless commerce) as the commerce backend under the storefront kit, alongside `teligant-headless` as the regulated clinical backend. Both parties continue to dig before making a final decision. This document is the canonical artifact for that research.

## Origin Of The Question

The question surfaced while sequencing Chapter 0 architecture decisions for the storefront kit. Specifically:

- The storefront kit needs typed adapters to a commerce backend to implement PLP, PDP, cart, and checkout surfaces.
- `teligant-headless` has not yet tranched catalog, cart, or checkout APIs. The roadmap's mock-adapter-first discipline accommodates that gap.
- Building catalog, cart, checkout, pricing, tax, shipping, inventory, promotions, orders, returns, and fulfillment into `teligant-headless` is a large engineering investment sitting outside the regulated moat.
- Competitor **Prescribery** reportedly delivers customer frontends on **WooCommerce** — validating the "regulated backend + separate commerce platform" pattern as commercially viable in telehealth.

The evaluation is whether Medusa can serve as that commerce platform in our stack, yielding a three-leg composition:

- **`teligant-headless`** — regulated clinical layer (intake, care requests, provider review, prescription, pharmacy, audit, compliance, tenant isolation, patient identity)
- **Medusa** — commerce layer (catalog, PLP/PDP data, cart, checkout, pricing, tax, shipping, inventory, orders, promotions, returns, fulfillment)
- **`teligant-headless-storefront`** — orchestration and presentation; typed adapters to both backends; Lattice-skinned customer deliverables

## What Medusa Is (As Of 2026-04-20)

- Open-source headless commerce platform; MIT-licensed.
- Built in TypeScript / Node.js; Postgres + Redis stack.
- Medusa 2.x introduced a composable module architecture and a workflow engine for orchestrating multi-step operations.
- Self-host (free) or Medusa Cloud (managed hosting).
- Pluggable providers: `AbstractAuthModuleProvider` for auth, payment module providers (Stripe, PayPal, etc.), fulfillment module providers.
- Ships a Next.js storefront starter as reference.
- Includes a React admin UI for merchant operations.
- Active ecosystem; meaningful DTC adoption.

## Market Validation

Prescribery — a backend-only telehealth competitor named in `telehealth-storefront-delivery-ambition.md` — reportedly delivers customer frontends on WooCommerce. The "regulated backend + commercial-grade commerce platform" pattern is not novel in telehealth; it is the incumbent solution for competitors who outsource frontend commerce.

Teligant's differentiated angle under this pattern:

- Replace WooCommerce with Medusa — a headless, composable, TypeScript-native alternative that aligns with our stack DNA.
- Deliver the storefront as bespoke governed IP (Lattice + kit + customer skin) rather than off-the-shelf themes.
- Keep the regulated backend as the unique moat.

## Proposed Architecture

### High-Level Shape

```
                STOREFRONT (Lattice-skinned Next.js per customer)
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
            ▼                   ▼                   ▼
   teligant-headless         Medusa         (CMS / content, TBD)
   (regulated clinical)    (commerce)
            │                   │
            ├── intake           ├── catalog / variants
            ├── care requests    ├── cart / checkout
            ├── prescriptions    ├── pricing / tax / shipping
            ├── provider queue   ├── orders / fulfillment
            ├── pharmacy         ├── promotions / returns
            ├── audit / PHI      └── merchant admin
            ├── patient auth
            └── clinical admin
```

### Authority Assignment

- **`teligant-headless` is the source of truth for user / patient identity.** Email, name, clinical record, prescriptions, authentication.
- **Medusa is the source of truth for commerce objects.** Products, variants, carts, orders, shipping addresses, payment methods, fulfillment state.
- **Medusa's `AuthIdentity` table links Medusa customer records to Teligant user IDs** via `entity_id`. No dual-write of credentials, no password sync.

### Authentication Architecture

Findings from Medusa 2.x documentation (retrieved via Context7 on 2026-04-20):

- Medusa's auth module is genuinely pluggable. `AbstractAuthModuleProvider` is the extension point; custom providers are registered in `medusa-config.ts` under `modules.auth.options.providers`.
- Shipped external-IdP reference: the **Okta integration guide** at `docs.medusajs.com/resources/integrations/guides/okta`. Same pattern applies to any external identity source, including a Teligant custom provider.
- The `AuthIdentity` primitive separates "who authenticated you" from "customer record." `entity_id` can be any stable external ID (email, UUID, Teligant user ID).
- Medusa issues its own JWT after the provider validates. Storefronts pass it as `Authorization: Bearer {jwt}`. Cookie session mode is also supported.
- The default `emailpass` provider can coexist with custom providers — e.g., admins log in with email/password while customers authenticate via a Teligant provider. Clean separation by actor type.

**Proposed:** a small `@teligant/medusa-auth-provider` package (~100–200 LOC) that:

1. Extends `AbstractAuthModuleProvider`.
2. On `authenticate` or `validateCallback`, calls Teligant's auth endpoint to verify credentials / token.
3. Creates or updates a Medusa `AuthIdentity` with `entity_id = teligant_user_id` and `user_metadata` mirrored from Teligant.
4. Returns success; Medusa issues the JWT.

**Password reset — resolved by the architecture, not by syncing:**

- Medusa does not store customer passwords under this pattern.
- Credential changes happen exclusively in Teligant and are instantly authoritative for all subsequent Medusa logins.
- If Teligant adopts magic-link / OTP auth (common in modern telehealth UX), the "password reset" question disappears entirely — no password to reset.

### Storefront Login Flow (Conceptual)

1. User enters email on storefront (e.g., Hedfirst).
2. Storefront → Teligant: request login (password verification OR magic-link OTP).
3. Teligant verifies, issues a Teligant session token.
4. Storefront → Medusa `/auth/customer/teligant`: exchange Teligant token for a Medusa JWT.
5. Medusa's custom provider validates with Teligant, links or updates `AuthIdentity`, issues its JWT.
6. Storefront now holds two tokens: Teligant (for clinical API) and Medusa (for commerce API).

**Alternative:** the storefront holds only the Teligant token; Medusa accepts Teligant tokens directly via the custom provider on every request (no Medusa JWT). Simpler storefront, tighter Medusa ↔ Teligant coupling. Trade-off worth weighing.

## Open Architectural Questions (Require Further Digging)

### 1. Mixed-cart orders

A cart may contain regulated (prescription, questionnaire-gated) and non-regulated (supplements, skincare, merch) line items. Medusa's default order lifecycle is `pending → processing → fulfilled`. Regulated line items need a `pending-clinical-approval` hold state until a Teligant provider approves.

Solvable via a Medusa 2.x **workflow** (not either/or with the fulfillment module — the two cooperate) that orchestrates: order placed → identify regulated SKUs → notify Teligant → wait for care-request approval → release fulfillment. Pricing / quoting stays Medusa's job; clinical decisioning stays Teligant's job. The line is clean at the fulfillment seam.

**Round 2 finding (2026-04-20):** The pattern is idiomatic, not fought. Medusa 2.x's workflow SDK supports long-running workflows via `createStep({ name, async: true }, ...)` — a workflow pauses at the async step and resumes only when external code calls `workflowEngineService.setStepSuccess({ idempotencyKey: { transactionId, stepId, workflowId, action: INVOKE }, stepResponse })`, or `setStepFailure` to trigger compensation. Subscribers on core events like `order.placed` trigger workflows automatically. The marketplace restaurant-delivery recipe in the Medusa docs uses exactly this shape — pausing for a restaurant to accept an order and a driver to claim a delivery — which is structurally identical to pausing for a clinician to approve a regulated line item.

Concrete sketch:

1. Subscriber on `order.placed` identifies regulated SKUs (by shipping profile or variant metadata) and, when present, runs `regulatedApprovalWorkflow` with the order ID.
2. Workflow step 1: notify Teligant (POST care-request payload). Persists the workflow's `transactionId` into Teligant so the approval webhook can route back.
3. Workflow step 2 (async): `waitForClinicalApproval` — no body; pauses indefinitely, subject to `timeout` / `maxRetries` options on the step.
4. Inbound webhook — a Medusa API route (e.g., `POST /hooks/teligant/approval`) resolves the Workflow Engine Module and calls `setStepSuccess` (approval) or `setStepFailure` (denial) keyed to the stored `transactionId`.
5. Workflow step 3: on resume, invoke `createOrderFulfillmentWorkflow` against the pharmacy-profile fulfillment only (see Dig Item 3 for how the split is expressed). On denial, compensation logic cancels / refunds the regulated line items without touching the non-regulated fulfillment.

The workflow engine also exposes a pub/sub `subscribe` API so the storefront can surface approval state to the patient without polling.

### 2. PHI compliance boundary

Linking patient identity + purchased medication + shipping address places some PHI inside Medusa's data model. Manageable under self-host with:

- Medusa on HIPAA-eligible infrastructure (AWS with BAA, GCP with BAA, or similar).
- Audit logging on Medusa customer / order tables.
- Data minimization — only the identity link is in Medusa; rich clinical record stays in Teligant.

**Round 2 finding (2026-04-20):** PHI scope enumerated below. BAA availability for **Medusa Cloud** is not present in public documentation and was not found in a Context7 pull of `medusajs/medusa` and related libraries; confirming it requires a direct sales inquiry with Medusa Inc. Treat self-host on HIPAA-eligible infra as the presumptive deployment target until that inquiry returns.

PHI data landing in Medusa under the proposed architecture, mapped against HIPAA Safe Harbor's 18 identifiers:

| Medusa table    | Representative fields                                                         | HIPAA identifier(s)                                                      |
|-----------------|-------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| `customer`      | email, first_name, last_name, phone, has_account                              | #1 Names, #4 Phone, #5 Email                                             |
| `auth_identity` | `entity_id = teligant_user_id`; `user_metadata` mirrored from Teligant        | #18 Other unique identifier (stable patient link)                        |
| `address`       | first/last name, address_1/2, city, postal_code, country                      | #1 Names, #2 Geographic subdivisions smaller than state                  |
| `order`         | customer_id, email, shipping/billing address, `placed_at`                     | #1, #2, #5; #3 Dates where order timing is treatment-adjacent            |
| `line_item`     | `variant_id` + product title (e.g., "Sildenafil 50mg") tied to `customer_id`  | **Load-bearing exposure** — (customer, medication) tuple is PHI per se   |
| `fulfillment`   | items + provider metadata; for pharmacy provider, prescription / shipment IDs | #9 Account numbers (shipment / prescription identifiers)                 |
| `payment`       | Stripe tokens (no raw PAN); billing address                                   | #1, #2 via billing address                                               |

**The load-bearing exposure is `line_item` — the tuple (identified customer, specific medication) is PHI under HIPAA even without any clinical data alongside it.** Payment card numbers are never stored (Stripe tokens). MRN, SSN, clinical notes, care-request payloads, and prescribing context remain exclusively in Teligant.

Mitigation path (assuming self-host):

- Deploy on HIPAA-eligible infrastructure under a BAA (AWS, GCP, Azure all offer).
- Encrypt at rest (Postgres TDE / RDS encryption) and in transit (TLS everywhere).
- Audit logging on writes and reads against `customer`, `order`, `line_item`, `address`, `fulfillment`.
- Medusa admin: SSO, role scoping, MFA, least-privilege.
- Subprocessor BAAs for every vendor touching Medusa data (Stripe — available; Medusa Cloud — TBD; email provider; logging / APM).
- Backup and retention policies aligned with HIPAA requirements.
- Rejected mitigation: storing generic SKUs (e.g., `RX-1001`) in Medusa and rendering patient-facing product titles from a Teligant-held mapping. Reduces `line_item` PHI surface but breaks merchant admin UX, reporting, and Medusa's promotion / pricing primitives. The PHI-mitigation ceiling on a properly-configured self-host is already adequate; the complexity cost of SKU obfuscation is not justified.

**Further dig (narrow):** contact Medusa Inc. sales re: BAA availability on Medusa Cloud and any HIPAA-specific posture. If unavailable, self-host is mandated; operational cost implications feed back into the decision cost model.

### 3. Pharmacy fulfillment handoff

Medusa's default fulfillment providers assume shipping labels and warehouse pick-pack. Prescription fulfillment routes through a licensed pharmacy with its own workflow (inventory, dispensing, pharmacist review, shipping).

Solvable via a custom Medusa fulfillment module that hands off regulated line items to Teligant's pharmacy integration; Teligant pharmacy workflow completes, webhooks back to Medusa to mark fulfilled.

**Round 2 finding (2026-04-20):** Split fulfillment across multiple providers within a single order is a first-class primitive in Medusa 2.x, expressed via **shipping profiles**. Each `ShippingOption` carries both a `shipping_profile_id` and a `provider_id`; products are assigned to profiles; checkout selects a shipping option per profile. An order spanning multiple profiles therefore produces multiple `fulfillment` records, each routed to a different provider. Medusa's own multi-region recipe documents this directly: merchants choose which fulfillment providers are available per stock location, and customers only see shipping options the providers in those locations can fulfill to their address.

Applied shape for telehealth:

- Define a `pharmacy` shipping profile; assign every regulated SKU to it.
- Keep the default `standard` shipping profile for non-regulated SKUs.
- Register a custom `TeligantPharmacyProvider` extending `AbstractFulfillmentProviderService`. Its `createFulfillment` hands off the regulated line items to Teligant's pharmacy integration; Teligant webhooks back to mark shipped / delivered.
- Keep `manual-fulfillment` (or a real carrier provider) for the `standard` profile.
- A mixed cart produces two shipping options at checkout — one per profile — priced independently.
- Post-placement, Medusa creates two `fulfillment` records. The pharmacy one is held by the approval workflow (Dig Item 1); the standard one releases immediately on `order.placed` through `createOrderFulfillmentWorkflow`.

The seams stay clean: Medusa owns fulfillment choreography and routing; Teligant owns clinical approval and pharmacy operations; the workflow engine gates only the pharmacy-profile fulfillment release.

### 4. Customer data sync

When a user changes their email / name in Teligant, Medusa's `user_metadata` on the `AuthIdentity` goes stale. Options:

- **Refresh on next login** — simplest; brief staleness window.
- **Teligant webhook → Medusa** on user-data changes — more ceremony; always fresh.

**Further dig:** how often does patient profile data change post-onboarding? If rarely, login-refresh is fine.

### 5. Teligant patient-auth surface

The shipped Teligant headless surfaces I have visibility into (`POST /v1/intake-sessions`, `GET /v1/care-requests/{id}/status`) appear session-token / ID-based, not user-authenticated. If Teligant does not have a patient auth API today, it needs one — either password-based or magic-link / OTP — before the Medusa integration can work.

**Further dig:** audit Teligant's current auth surface. This is a gating dependency for the Medusa direction.

### 6. Admin UX

Operators will touch two admins: Teligant admin for clinical workflows, Medusa admin for merchant operations. Acceptable at low volume. May deserve a unified-admin shim at scale. Out of scope for the initial decision.

### 7. Brand narrative

Teligant's pitch includes "purpose-built internal IP." Adopting Medusa shifts this to "purpose-built on best-in-class commerce primitives" — defensible but different. Sales and marketing implications worth sanity-checking.

### 8. Upgrade cadence

Medusa is fast-moving (2.0 was a significant rewrite in late 2024). Staying current on majors is ongoing work; the kit's adapter layer insulates customer sites from some of it, but not all.

### 9. Commerce-flow topology (intake-first vs. checkout-first)

Real-world telehealth frontends split into two distinct commerce-flow shapes. The kit must carry both; customer engagements will choose per product line or positioning.

**Shape A — Intake-first.** Pattern used by hims / hers. Product → clinical intake → eligibility → pre-approved cart → standard checkout → post-placement fast-path fulfillment release. Clinical decision precedes purchase commitment.

**Shape B — Checkout-first with auth-before-capture.** Browse → cart → checkout with card **authorized, not captured** → clinical review → capture on approval, void-and-refund-free cancel on denial → fulfillment release. Clinical decision follows purchase commitment.

Both must work within one kit; a single customer engagement may use Shape A for Rx and Shape B for non-Rx (or vice versa) concurrently.

**Round 3 finding (2026-04-20):** Both shapes are supported natively. Shape A is essentially invisible to Medusa — a storefront-orchestration pattern over an otherwise-default catalog / checkout. Shape B aligns with Medusa's **default** behavior: per the user guide, "Authorized is the default status when an order is placed, unless the payment provider is configured to automatically capture the payment." Auto-capture is opt-in, not opt-out. Configure the Stripe provider in `capture_method: manual` mode and Shape B becomes the path of least resistance, not a contortion.

Primitives verified against Medusa 2.x:

- `Payment` carries independent `authorized_amount` and `captured_amount`, plus `captures: CaptureDTO[]` for multiple partial captures against one authorization.
- `PaymentSessionStatus` enum: `AUTHORIZED`, `CAPTURED`, `PENDING`, `REQUIRES_MORE`, `ERROR`, `CANCELED`. Order `payment_status` supports `Authorized`, `Partially Authorized`, `Captured`, `Partially Captured`, `Refunded`, `Partially Refunded`.
- The order lifecycle is **tri-dimensional** — `status × payment_status × fulfillment_status` are independent fields. An order can legitimately sit in `(pending, authorized, not_fulfilled)` for days; no periodic job auto-transitions it.
- `capturePaymentWorkflow` is a first-class core workflow (takes `payment_id` + optional `amount`; runs as a nested step via `capturePaymentWorkflow.runAsStep(...)`).
- `order.metadata: Record<string, unknown>` cleanly stores `care_request_id` and the approval workflow's `transactionId` for webhook routing.
- **The official Medusa preorder tutorial is a near-exact template for Shape B** — `fulfillPreorderWorkflow` conditionally calls `capturePaymentWorkflow` with a computed amount tied to a downstream trigger. Same signal as Round 2's restaurant-delivery recipe: we compose blessed primitives, not invent patterns.

Applied shape:

- **Shape A** — storefront routes the user through Teligant intake, writes `care_request_id` to `order.metadata`, checks out under auto-capture. Subscriber on `order.placed` runs `regulatedApprovalWorkflow` in fast-path mode: verify approval is current → invoke `createOrderFulfillmentWorkflow` on the pharmacy profile.
- **Shape B** — Stripe provider configured `capture_method: manual`. Checkout authorizes only. Subscriber runs the Round 2 `regulatedApprovalWorkflow`; the approval-webhook resume step invokes `capturePaymentWorkflow.runAsStep` *then* `createOrderFulfillmentWorkflow` for the pharmacy profile. On denial, compensation cancels the order and the auth clears.
- **Mixed cart under Shape B** (supplement + Rx in one order) — capture the non-regulated total immediately on `order.placed`; defer the regulated total until approval. `captures` accumulates both partial captures on one payment; two fulfillments via the shipping-profile split (Dig Item 3).

Remaining risks / unknowns (not blocking):

1. **Stripe-specific manual-capture configuration.** The `capture_method: manual` option is widely supported on Medusa's Stripe provider, but the exact config shape wasn't in the Round 3 pull. Spot-check in a local prototype, not another Context7 round.
2. **Card-network auth hold expiration** is a Stripe concern Medusa doesn't track. Visa CNP is ~7 days; Mastercard and Amex are longer but variable. If clinical SLA ever exceeds the window, the auth lapses silently. Mitigation is an application-level scheduled job keyed to `payment.created_at` that either re-authorizes or notifies the patient before expiry.
3. **Partial capture under split fulfillment.** The primitives (array of captures, amount-parameterized workflow) support the mixed-cart Shape B case, but the preorder tutorial only demonstrates single-amount capture. Confirm multi-capture-on-one-payment choreography in a prototype.
4. **Reporting seam.** In Shape B, "order placed" ≠ "revenue realized." Medusa's `payment_status` breakdown is the right primitive; worth a sanity check against merchant-admin finance flows before customer handover.

## Pros (Accumulated)

1. **Massive scope reduction on `teligant-headless`.** Commerce tranche (catalog, cart, checkout, pricing, tax, shipping, inventory, promotions, orders, returns) comes off the roadmap.
2. **The moat sharpens.** Teligant focuses on regulated clinical workflow — the actual differentiation — and borrows commerce primitives from a platform designed for that purpose.
3. **Real adapters on day one.** Mock-first discipline collapses for commerce surfaces. Medusa adapters target a shipped, documented API. Only clinical surfaces stay mock-first until Teligant tranches them.
4. **Battle-tested commerce edges.** Multi-currency, tax jurisdictions, shipping complexity, inventory, returns, promotions — already handled. Edge cases we'd otherwise discover under customer pressure are already solved.
5. **MIT license.** No commercial lock-in. Self-host or Medusa Cloud at our discretion.
6. **TypeScript / Node stack DNA.** Fits alongside Teligant and the kit; shared tooling and mental model.
7. **Pluggable auth module.** "Teligant-canonical" is the intended shape, not a hack.
8. **Clean admin split.** Clinical ops in Teligant admin; commerce ops in Medusa admin. Each optimized for its job.
9. **Known composition pattern.** Prescribery + WooCommerce proves the shape at commercial scale. We are upgrading WooCommerce to Medusa, not inventing the model.

## Cons / Risks (Accumulated)

1. **Operational cost roughly doubles.** Two backends, two Postgres instances (or schemas), two deployment pipelines, two monitoring surfaces, two upgrade cadences.
2. **Integration engineering is real.** Custom auth provider, mixed-cart workflow, pharmacy fulfillment module, data-sync strategy. None unsolvable; all require thought.
3. **PHI scope expands.** Medusa now holds some patient-linked data. Compliance posture expands to cover Medusa; BAA / self-host decisions required.
4. **External-project dependency.** Medusa's roadmap is not ours to steer. Major-version upgrades are work we do not control.
5. **Teligant commerce planning becomes partially sunk cost.** Any roadmap or schema work already invested in the commerce tranche needs review for what to preserve vs. discard.
6. **Requires a Teligant patient-auth surface.** If not already shipped, Teligant needs a patient auth API. This is a new Teligant-side tranche dependency.
7. **Admin fragmentation.** Ops staff learn two UIs.
8. **Brand narrative shift.** From "purpose-built" to "purpose-built composition."

## What Changes If We Adopt

### In `teligant-headless-storefront`

- Chapter 0 gains a new decision (provisional D11): *Commerce backend = Medusa 2.x*.
- D05 (adapter strategy) reshapes: the kit has typed adapters to *two* backends — one set for Medusa commerce, one for Teligant clinical.
- Mock-first discipline applies only to un-tranched Teligant clinical surfaces. Medusa adapters are real on day one.
- `/apps/reference` boots against a local Medusa dev instance plus mocked / real Teligant endpoints as tranches land.
- First real integration is Hedfirst storefront against a Medusa instance (self-hosted or Medusa Cloud).

### In `teligant-headless`

- Commerce tranche comes off the roadmap.
- Scope sharpens to intake, care requests, provider review, prescription, pharmacy, audit, **patient auth**.
- Product-vision docs need updates reflecting the boundary change (`product-strategy-split.md`, related).
- Potential new tranche: patient auth API (magic-link or password) if not already shipped.
- Webhook surface expands: user-data-changed → Medusa; order-placed → Teligant clinical review; prescription-approved → Medusa fulfillment release.

### In Customer Delivery

- Each customer engagement now provisions a Medusa instance alongside the Teligant tenant. Customer-owned, customer-deployed.
- Medusa admin is part of customer handover.
- Customer-specific payment wiring (Stripe Connect, etc.) happens in Medusa, not the storefront.

### Commercial Implications

- Per-engagement Medusa setup and configuration is new scope. Pricing / packaging needs a look.
- Medusa Cloud vs. self-host is a per-customer decision with cost implications.

## What Changes If We Decline

- `teligant-headless` commerce tranche stays on the roadmap. Catalog, cart, checkout, etc. are built from scratch.
- Mock-first discipline stays in effect for longer on the storefront side.
- Hedfirst launch timing ties to Teligant commerce tranche availability.
- Total engineering investment is substantially higher.
- Moat narrative stays "fully purpose-built."

## Execution Roadmap If Adopted

**Status:** Proposed sequencing, not a locked plan. Contingent on D11 flipping to DECIDED after the two remaining tech-viability gates land. Captured here so the work pattern is visible before the decision — if D11 flips, this sequence is already pre-thought; if D11 is declined, nothing here locks us in.

### Remaining Gates (Tech Viability)

1. **Teligant patient-auth audit.** Confirm `teligant-headless` has a patient-auth surface today, or has a near-term tranche planned. Medusa's auth model depends on this upstream. Estimated: hours, not days. This is the real gate.
2. **Stripe manual-capture + multi-capture prototype.** Against a local Medusa dev instance, configure the Stripe provider in `capture_method: manual` and prove the Shape B choreography end-to-end: authorize at checkout → immediate partial capture on the non-regulated portion → deferred partial capture on the regulated portion gated by the approval workflow → split fulfillment across two shipping profiles. Estimated: 1-2 days. Closes the last non-commercial tech unknown from Dig Item 9.

### Sequencing Once Gates Pass

1. Flip **D11** in `chapter-0-architecture-decisions.md` to DECIDED (Medusa 2.x). Resolve **D05** concurrently with the two-backend adapter shape — generated adapters for Medusa commerce, hand-authored for Teligant clinical (OpenAPI spec state on the Teligant side is the factor gating a purely generated strategy for that backend).
2. Reshape **Ch 6** in `roadmap.md` to reflect the two-backend adapter surface plus a new kit-side Medusa extensions package (detail below).
3. Feed the scope change back to `teligant-headless`: commerce tranche comes off their roadmap; patient-auth tranche gets priority; webhook contracts authored for the integration seams (user-data-changed → Medusa; order-placed-for-clinical-review → Teligant; prescription-approved / denied → Medusa).

### Ch 6 Reshape

Current Ch 6 scope (per `roadmap.md`): real adapters for Teligant intake and care-request; mock adapters for catalog, cart, checkout.

Post-D11 scope:

- Real **generated** adapters to Medusa commerce surfaces (catalog, cart, checkout, pricing, orders, fulfillment) derived from Medusa's published OpenAPI spec.
- Real **hand-authored** adapters to Teligant clinical surfaces for tranches shipped (intake, care-request).
- Typed mock adapters for any Teligant clinical surfaces not yet tranched (patient-auth if still pending; additional surfaces as Teligant roadmap reveals them).
- **New workspace package: `@teligant/medusa-extensions`.** Contains:
  - Custom auth provider (extends `AbstractAuthModuleProvider`; validates against Teligant; `entity_id = teligant_user_id`).
  - Custom pharmacy fulfillment provider (extends `AbstractFulfillmentProviderService`; hands off regulated items to Teligant pharmacy; webhook-completes).
  - Regulated-approval workflow — async-step pattern from Dig Item 1. Two variants: **Shape A fast-path** (approval already in hand; verify currency + release fulfillment) and **Shape B capture-gated** (wait for approval, then `capturePaymentWorkflow.runAsStep` → `createOrderFulfillmentWorkflow`).
  - Teligant approval webhook handler — resumes workflow via `setStepSuccess` / `setStepFailure` keyed to the stored transaction ID.
  - Shipping-profile configuration helpers (pharmacy vs. standard).
  - Shape A / Shape B orchestration presets (auto-capture vs. `capture_method: manual`).

This package is the concrete expression of "we borrow Medusa's commerce primitives but the regulated-workflow glue is ours." It ships with the kit and is installed into each customer's Medusa instance during the build phase.

### Ch 9 Scope Addition

The onboarding runbook gains **per-customer Medusa instance provisioning** — infrastructure shape (HIPAA-eligible self-host presumed, per Dig Item 2), Stripe Connect wiring, shipping-profile setup, kit-extensions installation, Teligant auth provider configuration. This becomes a repeatable build-phase step, which sharpens the Ch 12 "running head start" claim: second-customer onboarding should be materially faster than first-customer onboarding, and the Medusa instantiation step is one of the new repeatable primitives.

### Ch 10 Under Medusa

The first-customer instance deployment includes a self-hosted Medusa instance on HIPAA-eligible infrastructure alongside the customer's Teligant tenant. Kit extensions installed. Products, variants, shipping profiles configured against the customer's catalog. Regulated SKUs routed through the pharmacy fulfillment provider + approval workflow. Both Shape A and Shape B exercised end-to-end (likely Shape A for Rx, Shape B for non-Rx within the same customer, per Dig Item 9).

### Pacing Read

The current `roadmap.md` 12-week pacing (foundations weeks 1-2, archetypes / adapter kickoff weeks 3-4, build phase weeks 5-8, launch + stabilize weeks 9-12) **holds better with Medusa than without**. Building commerce surfaces from scratch would have made weeks 5-8 very tight; consuming Medusa's shipped commerce surfaces front-loads only the kit-extensions scope — bounded to approximately 1-2 weeks of dedicated work, parallelizable with the Ch 3-5 Lattice / archetype work. Net: the same aggressive timeline becomes meaningfully less risky under Medusa than under build-from-scratch.

### Governance Addition

Medusa major-version upgrades become a tracked kit concern. The adapter layer insulates storefront code from minor churn; custom providers and workflows in `@teligant/medusa-extensions` require re-testing on each Medusa major. Surface in migration docs per `systems-approach.md`. Add to Ch 11 (kit hardening from first-customer learnings) and Ch 12 (second customer) review passes.

## Next-Dig Items (Before Decision)

In rough priority:

1. **Teligant patient-auth audit.** Does Teligant have a patient auth surface today? If not, what tranche would add it? This is the gate.
2. ~~**Medusa 2.x workflow engine review.**~~ **Resolved 2026-04-20.** Pattern is idiomatic via `async: true` steps + `setStepSuccess` / `setStepFailure` from a webhook-backed API route. See Dig Item 1 above.
3. ~~**Medusa fulfillment module API review.**~~ **Resolved 2026-04-20.** Split fulfillment is supported first-class via shipping profiles; one order produces multiple `fulfillment` records routed to different providers. See Dig Item 3 above.
4. ~~**PHI scoping exercise.**~~ **Resolved 2026-04-20.** Scope enumerated in Dig Item 2 above; load-bearing exposure is the (customer, medication) tuple in `line_item`. Mitigations via HIPAA-eligible self-host.
5. **Medusa hosting audit.** *Narrowed 2026-04-20.* Medusa Cloud BAA status is not documented in public docs; requires a direct sales inquiry. If unavailable, self-host on HIPAA-eligible infrastructure is mandated. See Dig Item 2.
6. **Pricing / licensing review.** Medusa is MIT-licensed (free self-host). Medusa Cloud pricing — pull current. Relevance reduces if #5 forces self-host anyway.
7. **Upgrade-cadence read.** How often do Medusa 2.x minors break things? Community experience.
8. **Data-sync pattern decision.** On-login-refresh vs. webhook-driven for user metadata in `AuthIdentity`. Low-priority but needs a call before kit implementation.
9. ~~**Payment-provider module audit.**~~ **Largely resolved 2026-04-20 (Round 3).** Authorize and capture are first-class independent primitives; `captures: CaptureDTO[]` supports multiple partial captures per payment; `capturePaymentWorkflow` runs as a nested step in an approval workflow; order lifecycle tolerates indefinite authorized-uncaptured state. See Dig Item 9 above. Remaining spot-checks (not Context7-shaped): exact Stripe `capture_method: manual` config shape, card-network auth-hold expiry handling, multi-capture choreography under shipping-profile split, merchant-admin finance-reporting UX.
10. **Admin unification question.** Is a unified-admin shim something to plan for V2, or live with two admins?

## Source Material

- `teligant-headless/docs/product-vision/telehealth-storefront-delivery-ambition.md` — strategic framing; moat identification.
- `teligant-headless/docs/product-vision/customer-storefront-delivery-model.md` — operational delivery model; ownership assignments.
- `docs/roadmap.md` — storefront kit chapter plan; mock-first adapter discipline.
- `docs/chapter-0-architecture-decisions.md` — current Ch 0 decisions; D05 (adapter strategy) and D10 (upgrade path) would be affected.
- Medusa 2.x documentation via Context7 (pulled 2026-04-20):
  - `/websites/medusajs_resources_integrations` — Okta auth provider guide (template for Teligant custom provider).
  - `/medusajs/medusa` — auth module configuration, JWT vs. cookie session, customer auth endpoints (Round 1); long-running workflow SDK (`createStep` with `async: true`, `setStepSuccess` / `setStepFailure` via Workflow Engine Module), `createOrderFulfillmentWorkflow`, subscribers on `order.placed`, marketplace restaurant-delivery async-step recipe (Round 2); fulfillment module contract — `ShippingOption` ↔ `shipping_profile_id` + `provider_id`, `AbstractFulfillmentProviderService`, multi-region / multi-provider routing (Round 2); payment module — `Payment` DTO with independent `authorized_amount` / `captured_amount`, `captures: CaptureDTO[]`, `PaymentSessionStatus` enum, `capturePaymentWorkflow`, `authorizePaymentSessionStep`, order `payment_status` states including `Partially Authorized` and `Partially Captured`, user-guide note that "Authorized is the default status when an order is placed," preorder tutorial (`fulfillPreorderWorkflow`) as the blessed template for delayed conditional capture (Round 3).
- Competitor observation: Prescribery + WooCommerce (anecdotal, as reported by Kelly, 2026-04-20).

## Revision History

- **2026-04-20** — Initial research capture. Evaluation open; both parties continuing to dig before a final decision.
- **2026-04-20** — Round 2 dig. Three of the top four Next-Dig items resolved against Medusa 2.x documentation (via Context7, library `/medusajs/medusa`): workflow engine supports the regulated-item-approval flow idiomatically through `async: true` steps and `setStepSuccess` from webhook-backed API routes (Dig Item 1); shipping profiles support split fulfillment across pharmacy + standard providers in a single order (Dig Item 3); PHI scope enumerated — load-bearing exposure is the `(customer, medication)` tuple in `line_item`, with clean mitigations under HIPAA-eligible self-host (Dig Item 2). Medusa Cloud BAA availability remains open and requires a direct sales inquiry (Next-Dig #5). Nothing in Round 2 overturns the proposed three-leg direction; D11 **remains PENDING** pending the Teligant patient-auth audit (Next-Dig #1) and the Medusa Cloud BAA inquiry (Next-Dig #5).
- **2026-04-20** — Round 3 dig. New Open Architectural Question added (Dig Item 9): commerce-flow topology — intake-first (hims / hers pattern) vs. checkout-first with auth-before-capture. Both shapes are supported natively in Medusa 2.x. Shape A is storefront orchestration over default catalog / checkout; Shape B aligns with Medusa's *default* behavior — per the user guide, "Authorized is the default status when an order is placed" — and the official preorder tutorial (`fulfillPreorderWorkflow`) is a near-exact template for conditional delayed capture gated by a downstream trigger. Payment primitives verified: independent `authorized_amount` / `captured_amount`, `captures: CaptureDTO[]` for multiple partial captures on one payment, `PaymentSessionStatus` enum, tri-dimensional order lifecycle (status × payment_status × fulfillment_status). Next-Dig #9 (payment-provider module audit) annotated as largely resolved; remaining items are prototype spot-checks (Stripe `capture_method: manual` config shape, card-network auth-hold expiry handling, multi-capture under split fulfillment, merchant-admin reporting UX). D11 **remains PENDING**; Round 3 further sharpens the proposed direction without flipping the call.
- **2026-04-20** — Execution Roadmap If Adopted section added. Captures the proposed work sequence if D11 flips to DECIDED: two remaining tech-viability gates (Teligant patient-auth audit + Stripe manual-capture / multi-capture prototype), then D11 / D05 resolution, then Ch 6 reshape to a two-backend adapter surface plus a new `@teligant/medusa-extensions` kit workspace package (custom auth provider, pharmacy fulfillment provider, regulated-approval workflow with Shape A / Shape B variants, webhook handler, shipping-profile helpers). Pacing check: current `roadmap.md` timeline holds *better* under Medusa than under build-from-scratch — kit-extensions scope is bounded (~1-2 weeks, parallelizable with Ch 3-5) where commerce-from-scratch would have blown weeks 5-8. Commercial BAA inquiry parked per user direction; section is tech-viability-only. D11 **remains PENDING**.
