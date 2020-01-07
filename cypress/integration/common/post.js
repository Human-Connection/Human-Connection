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
    .get(".user-avatar img")
    .should("have.attr", "src")
    .and("contain", narratorAvatar)
    .get(".user-teaser > .info > .text")
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

Then("I should see post with title {string} before the post with title {string}", (title_1, title_2) => {
  cy.get("h3.ds-heading-h3").eq(0).should("contain", title_1)
  cy.get("h3.ds-heading-h3").eq(1).should("contain", title_2)
})

And("I should be able to pin the post whose title contains {string}", (string)=> {
  cy.get("article.post-card").contains(string)
    .parent()
    .siblings("footer")
    .find("button.content-menu-trigger")
    .click()
    .get("a.ds-menu-item-link").contains("Pin post")
    .click()
    .reload()
  
    // .get("p").contains("Post pinned succesfully")
})

And("post with title {string} should have ribbon for pinned posts", (title) => {
  cy.get("article.post-card").contains(title)
  .parent()
  .find("div.ribbon.ribbon--pinned")
  .should("contain", "Announcement")
})

And("I should see a toast eith message {string}", (title) => {
  cy.get(".iziToast-message").contains("Comment Submitted");
})
