import { defineConfig } from "vitest/config";
import path from "path";

try {
  process.loadEnvFile?.(".env");
} catch {
  // If .env doesn't exist, environment variables may already be in process.env
}

export default defineConfig({
  test: {
    globals: true,
    include: ["src/**/*.integration.test.ts"],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./src/tests/mocks/empty.ts"),
    },
  },
});
