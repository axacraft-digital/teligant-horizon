# Context Transfer — Chapter 1: Scaffold + Charter

**Status:** Ready for execution (pending founder authorization to begin Chapter 1)
**Doc Class:** Context Transfer Packet
**Scope:** Land the minimum scaffold for `teligant-horizon` per ratified Chapter 0 decisions
**Canonical Authority:** Not implementation authority on its own. Implementation authority is the `DECIDED` entries in `docs/chapter-0-architecture-decisions.md`. This packet sequences and constrains the work.
**Created:** 2026-05-06
**Author:** `$SeniorPrincipalOfficeCTOHorizon`

---

## Agent Persona

This packet should be executed by an implementation agent operating under the authority of the **Senior Principal Engineer, Office of the CTO (Horizon)** persona defined in `docs/agents/senior-principal-engineer-office-of-the-cto-agent.md`.

The implementation agent is not the CTO agent. The CTO agent is the reviewer and the source of authority guidance. The implementation agent's job is to land the scaffold cleanly, not to make new product or architecture decisions. If a question arises that requires new architecture authority, escalate via the CTO agent's Decision Response Format rather than inferring.

## Invocation

```
You are the implementation agent for Chapter 1 (Scaffold + Charter) of teligant-horizon.

Read the entire packet at:
  docs/context-transfers/2026-05-06-chapter-1-scaffold-charter.md

Then read, in order:
  1. AGENTS.md
  2. CLAUDE.md
  3. docs/chapter-0-architecture-decisions.md (DECIDED entries are authority)
  4. docs/agents/senior-principal-engineer-office-of-the-cto-agent.md
  5. docs/roadmap.md § "Ch 1 — Scaffold + Charter"
  6. docs/seam/headless-surface-status.md (background only — no adapter work in Chapter 1)

Then begin Chapter 1 work as scoped in the packet. Stop conditions are listed
explicitly. Do not exceed scope. Validation expectations are listed in § Exit Criteria.

When done, post the final report against the § Exit Criteria checklist verbatim.
If any item is pending, say "pending" with one sentence on why; do not skip.
```

---

## Why This Packet Exists

Chapter 0 ratified on 2026-05-06: D01, D02, D03, D04, D05, D06, D08 are all `DECIDED`. The repo currently has docs only — no `package.json`, no lockfile, no scaffold. Chapter 1's job is to land the smallest scaffold that satisfies the Chapter 0 decisions and gives every later chapter a working substrate.

This packet exists because Chapter 1 is the first multi-step piece of work where an implementation agent could plausibly drift from intent. The risk is not that the agent won't write good code — it's that the agent will write *more* code than Chapter 1 requires. This packet is the guardrail.

## Locked Decisions This Packet Inherits

From `docs/chapter-0-architecture-decisions.md` (cite the entry, not this packet, when in doubt):

- **D01:** Next.js 16 + React + TypeScript on Node 24 LTS with npm workspaces. Kit primitives runtime-agnostic at the React layer; Next-specific helpers in a separate sub-export.
- **D02:** Monorepo with `apps/reference` (Next.js 16) + `packages/kit` (React + TS). Single root `package.json`, `package-lock.json`, `tsconfig.base.json`.
- **D03:** Tailwind v4 + Lattice tokens as runtime CSS custom properties via semantic theme bindings. No CSS-in-JS. Lint rule against raw color/spacing/font-size values in `packages/kit/src/**`.
- **D04:** Hybrid (kit package + starter template). Chapter 1 lands `apps/reference` as the proto-template; a dedicated `apps/starter-template` is not in scope here.
- **D05:** Hand-authored typed adapters. Chapter 1 does **not** implement adapters. It establishes the kit package shape that adapters will live in (Chapter 6).
- **D06:** Vitest + RTL + axe + msw + Playwright. Chapter 1 wires Vitest, RTL, and the script surface for all five layers; msw + Playwright + axe come fully online in later chapters but the scripts must exist.
- **D08:** Vercel default for `apps/reference`; no Vercel-specific imports in `packages/kit/src/**`.

If any of these conflict with what's in `docs/chapter-0-architecture-decisions.md`, the registry wins — not this packet.

## Scope (What This Packet Authorizes)

### In scope

1. **Workspace scaffold** — root `package.json` with npm workspaces declaring `apps/*` and `packages/*`. Root `package-lock.json`. Root `tsconfig.base.json` (strict TypeScript, project-references-friendly).
2. **`packages/kit`** — minimum viable kit package:
   - `packages/kit/package.json` (name: `@teligant/horizon-kit` or equivalent; private; exports both browser and server-only entry points).
   - `packages/kit/tsconfig.json` extending the base.
   - `packages/kit/src/index.ts` — empty barrel ready for primitives in Chapter 3.
   - `packages/kit/src/server/index.ts` — empty barrel for server-only adapter helpers (Chapter 6 will populate).
   - One placeholder primitive sufficient to prove component tests run (e.g., a typed `<Box>` or `<Stack>` exporting nothing more than what's needed to validate the build/test loop). This is **not** a real Lattice primitive; Chapter 3 will replace it.
3. **`apps/reference`** — minimum viable Next.js 16 app:
   - `apps/reference/package.json`.
   - `apps/reference/tsconfig.json` extending the base.
   - Next 16 App Router scaffold with **one** route (`/`) that renders the placeholder primitive from `@teligant/horizon-kit`.
   - Tailwind v4 wired with a `@theme` block ready for Lattice token bindings (the actual Lattice tokens land in Chapter 2).
4. **Tooling at the root:**
   - ESLint config that enforces:
     - no `next/*` imports inside `packages/kit/src/**` except in a Next-specific sub-export.
     - no `@vercel/*` imports inside `packages/kit/src/**`.
     - no raw color / spacing / font-size literals inside `packages/kit/src/**`.
   - Prettier config and ignore file.
   - Vitest root config + workspace config; `@testing-library/react` set up; one passing component test against the placeholder primitive.
   - Script stubs for the deferred test layers: `npm run test:e2e` (Playwright) and an msw setup file may be empty/`.skip` until Chapters 6/7, but the scripts must exist and exit 0 cleanly.
5. **Required commands** (must all succeed on a fresh clone after `npm install`):
   - `npm run check-types`
   - `npm run lint`
   - `npm run test`
   - `npm run build` (builds `apps/reference`)
   - `npm run dev` (starts `apps/reference`)
6. **CLAUDE.md update:** replace the "Commands" section's "no working commands yet" block with a "Commands that actually work" section listing exactly the six commands above. Also fold any genuine gotchas discovered during scaffold into the `Gotchas Learned The Hard Way` section.

### Out of scope (do NOT do these in Chapter 1)

- **No Lattice token implementation.** Chapter 2 owns this. The Tailwind `@theme` block is wired but empty.
- **No real primitives, archetypes, or sections.** Chapters 3 / 4 / 5 own these.
- **No Teligant adapters, real or mock.** Chapter 6 owns this. The `packages/kit/src/server/` barrel exists but is empty.
- **No reference-storefront content beyond a placeholder home page.** Chapter 7 owns reference content.
- **No analytics, consent banner, or content model code.** D09 and D12 are still `PENDING`.
- **No CI workflow files** (`.github/workflows/`). Defer to a separate small packet once the scaffold is green locally.
- **No Storybook, no design-token build pipeline, no codegen.** Speculation until later chapters demand them.
- **No `apps/starter-template` separate from `apps/reference`.** Defer per D04 follow-up.
- **No customer-specific code, branding, or content anywhere in the repo.**
- **No Vercel deployment configuration beyond what Next.js 16 emits by default** (no `vercel.json` unless absolutely required to make the default `next build` work; if it is required, document why).

If you find yourself reaching for any item in the "out of scope" list, stop and surface it to the founder via the CTO agent. It is a separate packet, not Chapter 1 drift.

## Exit Criteria

Chapter 1 is done when **all** of the following are true:

- [ ] Fresh clone of `main`, run `nvm use && npm install`, succeeds with no errors.
- [ ] `npm run check-types` passes across all workspaces.
- [ ] `npm run lint` passes (including the three lint rules in § Scope item 4).
- [ ] `npm run test` passes (at least the one component test against the placeholder primitive).
- [ ] `npm run build` produces a working `apps/reference` build.
- [ ] `npm run dev` starts `apps/reference` and the home page renders the placeholder primitive without errors.
- [ ] `npm run test:e2e` exists and exits 0 (even if it is a no-op skip placeholder).
- [ ] No `next/*` imports inside `packages/kit/src/**` except in a documented Next-specific sub-export. Lint rule enforces this.
- [ ] No `@vercel/*` imports inside `packages/kit/src/**`. Lint rule enforces this.
- [ ] No raw color / spacing / font-size literals inside `packages/kit/src/**`. Lint rule enforces this (configured even though there are no real primitives yet).
- [ ] CLAUDE.md "Commands" section replaced with "Commands that actually work" listing the six commands verbatim.
- [ ] `package-lock.json` committed at the repo root.
- [ ] `.gitignore` covers all build output produced by the scaffold (already covers most; verify and extend if needed).

## Stop Conditions

Stop and surface to the founder (do not infer) if any of the following arise:

- Chapter 0 entries appear to conflict with the scaffold work in a way that requires re-deciding architecture. The remedy is a Chapter 0 amendment, not a workaround.
- Tailwind v4's `@theme` mechanism cannot cleanly consume runtime CSS variables in Next.js 16 in a way that preserves D03's no-CSS-in-JS rule. (This should not happen, but if it does, it's an architectural surprise that warrants a CTO check.)
- The lint rules in § Scope item 4 cannot be expressed without invasive ESLint custom rule code. If the rules are not enforceable cheaply, propose an alternative enforcement and surface it.
- A scaffold step requires committing a secret, an `.env*` file, or any customer/PHI data.
- A required Next.js 16 / Tailwind v4 / Vitest / RTL version has a known incompatibility that would force a downgrade. Surface; do not work around silently.
- The temptation arises to add anything from § Out of scope.

## Branching And Commit Discipline

This is code work, not a docs change. Per `CLAUDE.md` § Git Discipline:

- Land Chapter 1 on a branch (suggested: `scaffold/chapter-1`), not directly on `main`.
- One PR for the whole scaffold is appropriate; this is a single coherent unit.
- The PR title should be: `Chapter 1: Scaffold + Charter`.
- The PR body should restate the Exit Criteria checklist with each item ticked.
- Commit messages should be specific (one commit for workspace scaffold, one for kit package shape, one for reference app, one for tooling, one for CLAUDE.md update is a reasonable rhythm).
- Do not skip hooks. Do not amend after push. Do not force-push.
- Include the `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer per repo convention.

## How The User Works

A few facts about Kelly that affect how to deliver this work:

- Kelly authorizes work in discrete steps and expects clean commits with descriptive messages.
- Kelly will read the diff before merging; the PR body is read carefully. Don't bury "I had to add X out of scope" in a paragraph — call it out.
- Kelly prefers concise, specific reports. Don't summarize what the diff already shows. Do flag anything surprising.
- Kelly works across `teligant-headless`, `teligant-horizon`, and `lattice-design-system` and switches context frequently. Cross-repo coherence (Node 24, Tailwind v4, Vitest, npm workspaces) is genuinely valuable and should be preserved by default.
- If something feels like a Chapter 2+ task masquerading as Chapter 1, it almost certainly is. Surface, don't absorb.
- Kelly will explicitly say "merge to main" or "push" when those are wanted. Do not push or merge without that signal.

## Next Packet Boundary

After Chapter 1 ships and the foundation has a green CI signal:

- **Chapter 2 — Lattice Foundations In Code.** Implements typography, spacing ladder, grid/layout primitives, color and semantic tokens, density, surfaces, state tokens, motion rules, and the skin override mechanism. Requires Lattice authority docs to cite directly.

Chapter 2 will get its own context transfer packet once Chapter 1 is shipped. Do not start Chapter 2 work in this packet.

## Open Questions Forward-Flagged

These do not block Chapter 1 but should be tracked:

1. **Private registry for `@teligant/horizon-kit`.** D04 follow-up. Default is npm with a private scope. Chapter 1 publishes nothing — this only matters when a customer project actually consumes the kit. Decision can wait until Chapter 8.
2. **Starter template location.** D04 follow-up. Default is in-repo (`apps/starter-template`). Chapter 1 does not create it. Decision can wait until Chapter 8 / 9.
3. **CI provider and workflow shape.** Out of scope here, but the next small packet after Chapter 1 should land a minimal GitHub Actions workflow that runs `npm run check-types && npm run lint && npm run test` on PRs. Easy follow-up; flagged so it is not forgotten.
