import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // GitHub Pages のサブパスでも動くよう相対パスにする(URL はハッシュ形式なのでパスは変わらない)
  base: "./",
  plugins: [react()],
  test: {
    include: ["scripts/**/*.test.ts", "src/**/*.test.{ts,tsx}"],
  },
});
