import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules",
      "dist",
      "dist-preview",
      "dist-review",
      ".cache",
      "public/data",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      // コンポーネントと同名の名前空間で Props を export する規約のため
      "@typescript-eslint/no-namespace": "off",
    },
  },
  {
    files: ["scripts/**/*.ts", "*.config.{js,cjs,ts}"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    extends: [reactHooks.configs.flat.recommended],
  },
);
