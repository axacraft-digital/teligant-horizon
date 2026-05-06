# Headless Surface Status (Horizon's view of the seam)

**Status:** Living mirror — read `teligant-headless` for authority
**Doc Class:** Reference / Tracking Document
**Scope:** What `teligant-headless` capabilities Horizon adapters target, and the shipped-vs-planned posture of each
**Canonical Authority:** Not authority. Authority is `/Users/kellysmith/Projects/teligant-headless/docs/product/status/status.yaml` and the linked authority docs.
**Created:** 2026-05-06

## Purpose

Chapter 6 (Typed Teligant Adapters) needs a Horizon-side answer to a recurring question: **"Is the Headless capability we're targeting shipped, planned, or speculative?"** Real adapters are allowed against shipped surfaces. Mock adapters are allowed against explicitly planned surfaces when they match the intended v1 contract. Speculative surfaces are not adapter candidates yet.

This doc gives Horizon a stable reference without forking the Headless authority stack. It must be re-synced — not invented — when Headless ships a new tranche or ratifies a new authority doc.

**Re-sync rule:** When a Horizon adapter is being designed or reviewed, read the Headless `status.yaml` first and update this mirror if it has drifted. Do not adapt against this file without confirming `status.yaml` matches.

## How to read this doc

For each capability:

- **Headless tranche / authority doc:** the source of record in `teligant-headless`.
- **Status:** mirrors Headless `status.yaml` shipped / shipped_with_followup / planned / future.
- **Horizon adapter posture:** what kind of adapter Horizon is allowed to write against this capability today.
  - **Real:** shipped Headless surface; real adapter against the live API.
  - **Mock-only:** Headless capability is planned with a known contract direction; mock adapter allowed if it matches the intended contract and is labeled as planned.
  - **Not yet:** Headless capability is too speculative; no adapter — real or mock — should be written against it.

## Capabilities

### Intake session creation (Headless T1, shipped)

- **Headless source:** `docs/product/execution-packet.md`, `docs/product/schema-packet.md`.
- **Status:** Shipped.
- **Horizon adapter posture:** Real. This is the canonical first adapter — entry point for hosted-intake handoff.
- **Notes:** Horizon's adapter must preserve tenant scoping and idempotency-key support per `AGENTS.md` Adapter Discipline.

### Resume token hash index (Headless T1p, shipped)

- **Headless source:** `docs/product/resume-token-hash-index-schema-packet.md`.
- **Status:** Shipped.
- **Horizon adapter posture:** N/A — backend-internal. No Horizon adapter needed.

### Hosted questionnaire runtime (Headless T2, shipped)

- **Headless source:** `docs/product/tranche-2-questionnaire-runtime-packet.md`.
- **Status:** Shipped.
- **Horizon adapter posture:** Real, but minimal. Horizon's role is to render the storefront-side handoff affordance and link/redirect into the hosted questionnaire URL returned by intake-session creation. The questionnaire runtime itself is hosted by Headless and is not embedded in storefront pages.

### Care request review core (Headless T3 / T3p, shipped)

- **Headless source:** `docs/product/tranche-3-care-request-review-runtime-packet.md`.
- **Status:** Shipped.
- **Horizon adapter posture:** Real for non-PHI status display only. Care request status lookup may render a customer-storefront-safe "your request is in review / approved / declined" affordance when authorized. Provider notes, clinical answers, prescribing context, and audit-only data must never appear in storefront state per `AGENTS.md` Regulated Boundary.

### Admin auth wiring + seed provider reviewer (Headless T3a, shipped_with_followup)

- **Headless source:** `docs/product/tranche-3a-admin-auth-wiring-packet.md`.
- **Status:** Shipped (with resolved follow-up).
- **Horizon adapter posture:** N/A — admin-side capability. Horizon storefronts do not authenticate as admins or providers.

### Webhook delivery runtime (Headless T4, shipped)

- **Headless source:** `docs/product/tranche-4-webhook-delivery-runtime-packet.md`.
- **Status:** Shipped.
- **Horizon adapter posture:** Real for customer-storefront-safe **inbound webhook receive** patterns when a customer storefront wants to update a non-PHI status surface based on Headless events. Horizon should provide webhook-signature verification helpers and event-display patterns. It must not reimplement webhook delivery; it consumes Headless webhooks at the customer-owned edge.

### Branch A — customer-orchestrated commerce + handoff (commerce_orchestration authority, ratified 2026-04-22)

- **Headless source:** `docs/product/commerce-orchestration-authority.md`, `docs/product/customer-orchestrated-handoff-contract-memo.md`, `docs/product/wave-3-branch-a-commerce-execution-packet.md`.
- **Status:** Authoritative authority doc; specific runtime tranches still being packetized.
- **Horizon adapter posture:** Mock-only until the Branch A handoff runtime ships. The contract direction is locked enough to draft a mock-shaped adapter; the real implementation should not land before Headless ships the matching tranche. Branch A is the **default headless posture** per `AGENTS.md` Commerce / Checkout Discipline.
- **Critical rule:** Horizon never accepts raw card data and never implements a payment rail. Branch A handoff is the *handoff into regulated workflow after the customer's own checkout completes*; payment processor relationship stays customer-owned.

### Branch B — Teligant-orchestrated checkout (commerce_orchestration authority, reserved)

- **Headless source:** `docs/product/branch-b-checkout-execution-packet-map.md`, `docs/product/commerce-orchestration-authority.md`.
- **Status:** Reserved / controlled rollout per `AGENTS.md` Commerce / Checkout Discipline.
- **Horizon adapter posture:** Not yet. Implementing a Branch B checkout path in Horizon requires explicit founder authority. Do not draft a Branch B adapter — even a mock — until that authority is granted.

### Patient action portal + information request runtime (Headless T5, planned)

- **Headless source:** Capability listed in `status.yaml`; packet not yet authored. Gate: "decide patient auth posture before packetization."
- **Status:** Planned.
- **Horizon adapter posture:** Not yet. Patient auth posture is unresolved upstream; any storefront integration that authenticates as a patient is forbidden today per `AGENTS.md` Storefront Boundary. Revisit when the Headless patient auth decision lands.

### Platform + clinic admin operations baseline (Headless T6, planned)

- **Status:** Planned.
- **Horizon adapter posture:** N/A — admin-side capability.

### External API contract authority (authoritative, ratified 2026-04-20)

- **Headless source:** `docs/product/external-api-contract-authority.md`.
- **Status:** Authoritative authority doc.
- **Horizon adapter posture:** **Read this before writing any adapter.** External API contract shape, error envelopes, versioning, and idempotency rules are governed here. Adapter types in `packages/kit` must reflect this contract; drift is a blocking defect per `docs/agents/senior-principal-engineer-office-of-the-cto-agent.md` § Headless Seam Discipline Rule.

### API client auth authority (authoritative, ratified 2026-04-21)

- **Headless source:** `docs/product/auth-and-access/api-client-auth-authority.md`.
- **Status:** Authoritative authority doc.
- **Horizon adapter posture:** Tenant-bound API keys. Server-side only. Adapter exports must enforce server-only credential handling and fail fast if imported into a client bundle (per D08 Locked constraints).

## What this list deliberately omits

- Authority docs that govern internal-to-Headless concerns (admin_auth_context, infrastructure_services, admin_surface_tranche_authority, admin_identity_lifecycle, data_retention_policy). These do not produce Horizon adapter surfaces. They are out of scope for the seam.
- Future candidates listed in Headless `status.yaml` (provider coordination, billing automation, support messaging, domain lifecycle). Too speculative for adapter planning.

## Re-sync triggers

Update this doc when any of the following happen in `teligant-headless`:

- A new tranche ships (status flips to `shipped`).
- A planned tranche packetizes and the contract direction firms up.
- An authority doc ratifies.
- The Branch A or Branch B commerce posture changes.
- The patient auth posture is decided (T5 unblocks).

## Open Horizon questions this doc surfaces

These are not blockers; they are forward-flagged for the Chapter 6 adapter packet:

1. **Webhook receive helpers in the kit vs in customer projects.** Should Horizon's kit ship a typed webhook-receive utility (signature verification + event-shape parsing) or leave that to customer projects? Probably kit, since the signature/contract logic is foundation-shaped; raise in Chapter 6.
2. **Status-display affordance shape.** Care request status display is allowed but PHI minimization rules are strict. Worth a short adapter spec describing exactly what fields are storefront-safe before Chapter 6 begins.
3. **Branch A handoff timing.** Headless's Branch A runtime tranche is not yet shipped. Mock adapter lands first; cut-over to real adapter requires a concrete trigger (PR shipped on Headless side). That trigger should be named in the Chapter 6 packet, not implied.
