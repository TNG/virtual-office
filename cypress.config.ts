import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:9000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.ts",
  },
});
