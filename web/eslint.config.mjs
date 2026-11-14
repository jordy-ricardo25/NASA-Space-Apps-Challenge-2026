import { FlatCompat } from "@eslint/eslintrc";

// eslint-config-next 15 publica su configuración en el formato clásico:
// FlatCompat la adapta al formato plano que usa ESLint 9.
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", "test-results/**", "playwright-report/**"],
  },
];

export default eslintConfig;
