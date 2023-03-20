import { getContainerEl } from "@cypress/mount-utils";

Cypress.on("run:start", () => {
  if (Cypress.testingType !== "component") {
    return;
  }

  Cypress.on("test:before:run", () => {
    const containerEl = getContainerEl();
    containerEl.innerHTML = "";
  });
});

// i am definitely a valid es module
export const dummy = 'hi';
