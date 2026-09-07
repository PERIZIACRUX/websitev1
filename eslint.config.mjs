import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Explicitly ignore directories that should not be linted
  globalIgnores([
    // Next.js build outputs
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    // Generated files
    "next-env.d.ts",
    "*.tsbuildinfo",
    // Dependencies (ESLint v9 flat config doesn't auto-ignore these)
    "node_modules/**",
    // Non-TypeScript dirs
    "coverage/**",
    "public/**",
    "database/**",
    "docs/**",
    "tests/load/**",
  ]),
  {
    rules: {
      // Allow _underscore-prefixed parameters (intentionally unused placeholders)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
]);

export default eslintConfig;

