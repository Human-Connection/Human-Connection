import { When, Then } from "cypress-cucumber-preprocessor/steps";

/* global cy */

When("I visit my profile page", () => {
  cy.openPage("profile/peter-pan");
});

Then("I should be able to change my profile picture", () => {
  const avatarUpload = "onourjourney.png";

  cy.fixture(avatarUpload, "base64").then(fileContent => {
    cy.get("#customdropzone").upload(
      { fileContent, fileName: avatarUpload, mimeType: "image/png" },
      { subjectType: "drag-n-drop", force: true }
    );
  });
  cy.get(".profile-avatar img")
    .should("have.attr", "src")
    .and("contains", "onourjourney");
  cy.contains(".iziToast-message", "Upload successful").should(
    "have.length",
    1
  );
});

When("I visit another user's profile page", () => {
  cy.openPage("profile/peter-pan");
});

Then("I cannot upload a picture", () => {
  cy.get(".ds-card-content")
    .children()
    .should("not.have.id", "customdropzone")
    .should("have.class", "ds-avatar");
});
