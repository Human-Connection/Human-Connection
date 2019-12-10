import { When, Then } from "cypress-cucumber-preprocessor/steps";

const narratorAvatar =
  "https://s3.amazonaws.com/uifaces/faces/twitter/nerrsoft/128.jpg";

When("I type in a comment with {int} characters", size => {
  var c="";
  for (var i = 0; i < size; i++) {
    c += "c"
  }
  cy.get(".editor .ProseMirror").type(c);
});

Then("I click on the {string} button", text => {
  cy.get("button")
    .contains(text)
    .click();
});

Then("my comment should be successfully created", () => {
  cy.get(".iziToast-message").contains("Comment Submitted");
});

Then("I should see my comment", () => {
  cy.get("div.comment p")
    .should("contain", "Human Connection rocks")
    .get(".ds-avatar img")
    .should("have.attr", "src")
    .and("contain", narratorAvatar)
    .get("div p.ds-text span")
    .should("contain", "today at");
});

Then("I should see the entirety of my comment", () => {
  cy.get("div.comment")
  .should("not.contain", "show more")
});

Then("I should see an abreviated version of my comment", () => {
  cy.get("div.comment")
  .should("contain", "show more")
});

Then("the editor should be cleared", () => {
  cy.get(".ProseMirror p").should("have.class", "is-empty");
});
