import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    specPattern: ["cypress/*.cy.ts"],
  },
});
