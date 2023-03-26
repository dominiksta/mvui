import { getContainerEl } from "@cypress/mount-utils";
import { setupWorker } from "msw";
import { handlers } from '../mocks/handlers';

Cypress.on("run:start", () => {
  if (Cypress.testingType !== "component") {
    return;
  }
  // This is technically a race condition because the `.start` method is async and so
  // tests might run before it completes. In practice, this has never happened and cypress
  // does not seem to respect making this callback async anyway sooooo...
  setupWorker(...handlers).start({ quiet: true });

  Cypress.on("test:before:run", () => {
    const containerEl = getContainerEl();
    containerEl.innerHTML = "";
  });
});
