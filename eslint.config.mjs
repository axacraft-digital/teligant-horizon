import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

const NO_RAW_DESIGN_VALUES_REGEX =
  "/(#[0-9a-fA-F]{3,8}\\b|\\brgb\\(|\\brgba\\(|\\bhsl\\(|\\bhsla\\(|\\boklch\\(|\\boklab\\()/";

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
          selector: `Literal[value=${NO_RAW_DESIGN_VALUES_REGEX}]`,
          message:
            "Raw color literals (hex, rgb, hsl, oklch) are forbidden in packages/kit. Use semantic Lattice tokens. See Chapter 0 D03.",
        },
        {
          selector: `TemplateElement[value.raw=${NO_RAW_DESIGN_VALUES_REGEX}]`,
          message:
            "Raw color literals are forbidden in packages/kit template strings. Use semantic Lattice tokens. See Chapter 0 D03.",
        },
      ],
    },
  },
);
