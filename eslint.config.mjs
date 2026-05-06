import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

// Raw color value forms (hex, rgb/rgba, hsl/hsla, oklch, oklab).
const NO_RAW_COLOR_REGEX =
  "/(#[0-9a-fA-F]{3,8}\\b|\\brgb\\(|\\brgba\\(|\\bhsl\\(|\\bhsla\\(|\\boklch\\(|\\boklab\\()/";

// Tailwind arbitrary-value escape hatch for spacing-related utilities.
// Matches things like `px-4` only if it has a `[...]` arbitrary-value bracket:
// `px-[7px]`, `gap-[1.25rem]`, `space-x-[12px]`, `mt-[2rem]`, `w-[400px]`.
// Plain semantic utilities (`px-4`, `gap-2`) are intentionally allowed —
// those bind to Tailwind theme tokens, which Chapter 2 binds to Lattice.
const TW_ARBITRARY_SPACING_REGEX =
  "/\\b(?:p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y|w|h|min-w|min-h|max-w|max-h|top|right|bottom|left|inset|inset-x|inset-y|translate-x|translate-y|size|basis)-\\[[^\\]]+\\]/";

// Tailwind arbitrary-value escape hatch for font-size: `text-[14px]`,
// `text-[1.25rem]`, `text-[18pt]`, `text-[var(--lattice-fs-body)]`.
// All forms are forbidden in the kit — D03's intent is that components
// consume semantic Tailwind classes (`text-body`, `text-display`) bound
// to Lattice typography tokens via `@theme`. If a token needs a class,
// add the `@theme` binding; do not reach for the arbitrary-value hatch
// at the call site.
const TW_ARBITRARY_FONT_SIZE_REGEX = "/\\btext-\\[[^\\]]+\\]/";

// CSS-style raw values smuggled through template strings or string literals
// (e.g. `padding: 14px`, `font-size: 1rem`, `gap: 8px`).
const RAW_CSS_DIMENSION_REGEX =
  "/\\b(?:padding|margin|font-size|gap|width|height|top|right|bottom|left|inset)\\s*:\\s*\\d+(?:\\.\\d+)?(?:px|rem|em|pt|%)\\b/";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/out/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/*.config.cjs",
      "**/*.config.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  // Kit discipline: forbid Next.js, Vercel, and raw design values inside the
  // shared kit package. These rules implement the D01, D03, and D08 locked
  // constraints from docs/chapter-0-architecture-decisions.md. If you find
  // yourself wanting to disable one of these, that is the signal to escalate
  // via the CTO agent — not to add an eslint-disable.
  {
    files: ["packages/kit/src/**/*.{ts,tsx}"],
    ignores: ["packages/kit/src/next/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["next", "next/*"],
              message:
                "packages/kit must stay runtime-agnostic at the React layer. Next-specific helpers belong in packages/kit/src/next/. See Chapter 0 D01.",
            },
            {
              group: ["@vercel/*"],
              message:
                "packages/kit must remain deployment-agnostic. Vercel-specific code belongs in apps/reference. See Chapter 0 D08.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='style']",
          message:
            "Raw inline style props are forbidden in packages/kit. Use Tailwind utility classes bound to Lattice tokens. See Chapter 0 D03.",
        },
        {
          selector: `Literal[value=${NO_RAW_COLOR_REGEX}]`,
          message:
            "Raw color literals (hex, rgb, hsl, oklch) are forbidden in packages/kit. Use semantic Lattice tokens. See Chapter 0 D03.",
        },
        {
          selector: `TemplateElement[value.raw=${NO_RAW_COLOR_REGEX}]`,
          message:
            "Raw color literals are forbidden in packages/kit template strings. Use semantic Lattice tokens. See Chapter 0 D03.",
        },
        {
          selector: `Literal[value=${TW_ARBITRARY_SPACING_REGEX}]`,
          message:
            "Tailwind arbitrary-value spacing (e.g. `px-[7px]`, `gap-[12px]`, `mt-[1.25rem]`) is forbidden in packages/kit. Use semantic spacing utilities bound to Lattice tokens. See Chapter 0 D03.",
        },
        {
          selector: `TemplateElement[value.raw=${TW_ARBITRARY_SPACING_REGEX}]`,
          message:
            "Tailwind arbitrary-value spacing is forbidden in packages/kit template strings. Use semantic spacing utilities bound to Lattice tokens. See Chapter 0 D03.",
        },
        {
          selector: `Literal[value=${TW_ARBITRARY_FONT_SIZE_REGEX}]`,
          message:
            "Tailwind arbitrary-value font sizes (e.g. `text-[14px]`, `text-[1.25rem]`) are forbidden in packages/kit. Use semantic `text-*` utilities bound to Lattice typography tokens. See Chapter 0 D03.",
        },
        {
          selector: `TemplateElement[value.raw=${TW_ARBITRARY_FONT_SIZE_REGEX}]`,
          message:
            "Tailwind arbitrary-value font sizes are forbidden in packages/kit template strings. Use semantic `text-*` utilities bound to Lattice typography tokens. See Chapter 0 D03.",
        },
        {
          selector: `Literal[value=${RAW_CSS_DIMENSION_REGEX}]`,
          message:
            "Raw CSS dimension values (e.g. `padding: 14px`, `font-size: 1rem`) are forbidden in packages/kit. Use semantic Lattice tokens via Tailwind utilities. See Chapter 0 D03.",
        },
        {
          selector: `TemplateElement[value.raw=${RAW_CSS_DIMENSION_REGEX}]`,
          message:
            "Raw CSS dimension values in template strings are forbidden in packages/kit. Use semantic Lattice tokens via Tailwind utilities. See Chapter 0 D03.",
        },
      ],
    },
  },
);
