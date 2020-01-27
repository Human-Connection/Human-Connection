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

Then("I click on the reply button", () => {
  cy.get(".reply-button")
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

Then("it should create a mention in the CommentForm", () => {
  cy.get(".ProseMirror a")
    .should('have.class', 'mention')
    should('contain', '@peter-pan')
})

When("I open the content menu of post {string}", (title)=> {
  cy.contains('.post-card', title)
  .find('.content-menu .base-button')
  .click()
})

When("I click on 'Pin post'", (string)=> {
  cy.get("a.ds-menu-item-link").contains("Pin post")
    .click()
})

Then("there is no button to pin a post", () => {
  cy.get("a.ds-menu-item-link")
    .should('contain', "Report Post") // sanity check
    .should('not.contain', "Pin post")
})

And("the post with title {string} has a ribbon for pinned posts", (title) => {
  cy.get("article.post-card").contains(title)
  .parent()
  .find("div.ribbon.ribbon--pinned")
  .should("contain", "Announcement")
})

Then("I see a toaster with {string}", (title) => {
  cy.get(".iziToast-message").should("contain", title);
})
