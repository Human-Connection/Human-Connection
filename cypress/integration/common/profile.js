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
  cy.contains(".iziToast-message", "Avatar upload successful!").should(
    "have.length",
    1
  );
});

Then("I should be able to change my profile header picture", () => {
  const headerUpload = "onourjourney.png";

  cy.fixture(headerUpload, "base64").then(fileContent => {
    cy.get("#profileHeaderDropzone").upload(
      { fileContent, fileName: headerUpload, mimeType: "image/png" },
      { subjectType: "drag-n-drop", force: true }
    );
  });
  cy.get(".profile-header-image")
    .should("have.attr", "src")
    .and("contains", "onourjourney");
  cy.contains(".iziToast-message", "Avatar upload successful!").should(
    "have.length",
    1
  );
});

When("I visit another user's profile page", () => {
  cy.openPage("profile/peter-pan");
});

Then("I cannot upload a profile picture", () => {
  cy.get(".base-card")
    .children()
    .should("not.have.id", "customdropzone")
    .should("have.class", "user-avatar");
});


Then("I cannot upload a profile header image", () => {
  cy.get(".base-card")
    .children()
    .should("not.have.id", "profileHeaderDropzone")
    .should("have.class", "profile-header");
});
