import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    include: ["proxy.test.ts", "components/ui/**/*.test.tsx", "components/shell/**/*.test.tsx", "components/cohorts/**/*.test.tsx", "components/content/**/*.test.tsx", "components/teacher/**/*.test.tsx", "app/theme.test.ts", "lib/navigation.test.ts", "lib/teacher/**/*.test.ts"],
  },
});
