import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import { getLangByName } from "../../support/helpers";

/* global cy  */

let lastPost = {};

let loginCredentials = {
  email: "peterpan@example.org",
  password: "1234"
};
const narratorParams = {
  name: "Peter Pan",
  avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/nerrsoft/128.jpg",
  ...loginCredentials
};

Given("I am logged in", () => {
  cy.login(loginCredentials);
});

Given("we have a selection of tags and categories as well as posts", () => {
  cy.factory()
    .authenticateAs(loginCredentials)
    .create("Category", {
      id: "cat1",
      name: "Just For Fun",
      slug: "justforfun",
      icon: "smile"
    })
    .create("Category", {
      id: "cat2",
      name: "Happyness & Values",
      slug: "happyness-values",
      icon: "heart-o"
    })
    .create("Category", {
      id: "cat3",
      name: "Health & Wellbeing",
      slug: "health-wellbeing",
      icon: "medkit"
    })
    .create("Tag", { id: "t1", name: "Ecology" })
    .create("Tag", { id: "t2", name: "Nature" })
    .create("Tag", { id: "t3", name: "Democracy" });

  const someAuthor = {
    id: "authorId",
    email: "author@example.org",
    password: "1234"
  };
  const yetAnotherAuthor = {
    id: "yetAnotherAuthor",
    email: "yet-another-author@example.org",
    password: "1234"
  };
  cy.factory()
    .create("User", someAuthor)
    .authenticateAs(someAuthor)
    .create("Post", { id: "p0" })
    .create("Post", { id: "p1" });
  cy.factory()
    .create("User", yetAnotherAuthor)
    .authenticateAs(yetAnotherAuthor)
    .create("Post", { id: "p2" });
  cy.factory()
    .authenticateAs(loginCredentials)
    .create("Post", { id: "p3" })
    .relate("Post", "Categories", { from: "p0", to: "cat1" })
    .relate("Post", "Categories", { from: "p1", to: "cat2" })
    .relate("Post", "Categories", { from: "p2", to: "cat1" })
    .relate("Post", "Tags", { from: "p0", to: "t1" })
    .relate("Post", "Tags", { from: "p0", to: "t2" })
    .relate("Post", "Tags", { from: "p0", to: "t3" })
    .relate("Post", "Tags", { from: "p1", to: "t2" })
    .relate("Post", "Tags", { from: "p1", to: "t3" })
    .relate("Post", "Tags", { from: "p2", to: "t2" })
    .relate("Post", "Tags", { from: "p2", to: "t3" })
    .relate("Post", "Tags", { from: "p3", to: "t3" });
});

Given("we have the following user accounts:", table => {
  table.hashes().forEach(params => {
    cy.factory().create("User", params);
  });
});

Given("I have a user account", () => {
  cy.factory().create("User", narratorParams);
});

Given("my user account has the role {string}", role => {
  cy.factory().create("User", {
    role,
    ...loginCredentials
  });
});

When("I log out", cy.logout);

When("I visit {string}", page => {
  cy.openPage(page);
});

When("I visit the {string} page", page => {
  cy.openPage(page);
});

Given("I am on the {string} page", page => {
  cy.openPage(page);
});

When("I fill in my email and password combination and click submit", () => {
  cy.login(loginCredentials);
});

When(/(?:when )?I refresh the page/, () => {
  cy.reload();
});

When("I log out through the menu in the top right corner", () => {
  cy.get(".avatar-menu").click();
  cy.get(".avatar-menu-popover")
    .find('a[href="/logout"]')
    .click();
});

Then("I can see my name {string} in the dropdown menu", () => {
  cy.get(".avatar-menu-popover").should("contain", narratorParams.name);
});

Then("I see the login screen again", () => {
  cy.location("pathname").should("contain", "/login");
});

Then("I can click on my profile picture in the top right corner", () => {
  cy.get(".avatar-menu").click();
  cy.get(".avatar-menu-popover");
});

Then("I am still logged in", () => {
  cy.get(".avatar-menu").click();
  cy.get(".avatar-menu-popover").contains(narratorParams.name);
});

When("I select {string} in the language menu", name => {
  cy.switchLanguage(name, true);
});
Given("I previously switched the language to {string}", name => {
  cy.switchLanguage(name, true);
});
Then("the whole user interface appears in {string}", name => {
  const lang = getLangByName(name);
  cy.get(`html[lang=${lang.code}]`);
  cy.getCookie("locale").should("have.property", "value", lang.code);
});
Then("I see a button with the label {string}", label => {
  cy.contains("button", label);
});

When(`I click on {string}`, linkOrButton => {
  cy.contains(linkOrButton).click();
});

When(`I click on the menu item {string}`, linkOrButton => {
  cy.contains(".ds-menu-item", linkOrButton).click();
});

When("I press {string}", label => {
  cy.contains(label).click();
});

Given("we have the following posts in our database:", table => {
  table.hashes().forEach(({ Author, ...postAttributes }) => {
    const userAttributes = {
      name: Author,
      email: `${Author}@example.org`,
      password: "1234"
    };
    postAttributes.deleted = Boolean(postAttributes.deleted);
    const disabled = Boolean(postAttributes.disabled);
    cy.factory()
      .create("User", userAttributes)
      .authenticateAs(userAttributes)
      .create("Post", postAttributes);
    if (disabled) {
      const moderatorParams = {
        email: "moderator@example.org",
        role: "moderator",
        password: "1234"
      };
      cy.factory()
        .create("User", moderatorParams)
        .authenticateAs(moderatorParams)
        .mutate("mutation($id: ID!) { disable(id: $id) }", postAttributes);
    }
  });
});

Then("I see a success message:", message => {
  cy.contains(message);
});

When("I click on the avatar menu in the top right corner", () => {
  cy.get(".avatar-menu").click();
});

When(
  "I click on the big plus icon in the bottom right corner to create post",
  () => {
    cy.get(".post-add-button").click();
  }
);

Given("I previously created a post", () => {
  lastPost.title = "previously created post";
  lastPost.content = "with some content";
  cy.factory()
    .authenticateAs(loginCredentials)
    .create("Post", lastPost);
});

When("I choose {string} as the title of the post", title => {
  lastPost.title = title.replace("\n", " ");
  cy.get('input[name="title"]').type(lastPost.title);
});

When("I type in the following text:", text => {
  lastPost.content = text.replace("\n", " ");
  cy.get(".ProseMirror").type(lastPost.content);
});

Then("the post shows up on the landing page at position {int}", index => {
  cy.openPage("landing");
  const selector = `.post-card:nth-child(${index}) > .ds-card-content`;
  cy.get(selector).should("contain", lastPost.title);
  cy.get(selector).should("contain", lastPost.content);
});

Then("I get redirected to {string}", route => {
  cy.location("pathname").should("contain", route.replace("...", ""));
});

Then("the post was saved successfully", () => {
  cy.get(".ds-card-content > .ds-heading").should("contain", lastPost.title);
  cy.get(".content").should("contain", lastPost.content);
});

Then(/^I should see only ([0-9]+) posts? on the landing page/, postCount => {
  cy.get(".post-card").should("have.length", postCount);
});

Then("the first post on the landing page has the title:", title => {
  cy.get(".post-card:first").should("contain", title);
});

Then(
  "the page {string} returns a 404 error with a message:",
  (route, message) => {
    // TODO: how can we check HTTP codes with cypress?
    cy.visit(route, { failOnStatusCode: false });
    cy.get(".error").should("contain", message);
  }
);

Given("my user account has the following login credentials:", table => {
  loginCredentials = table.hashes()[0];
  cy.debug();
  cy.factory().create("User", loginCredentials);
});

When("I fill the password form with:", table => {
  table = table.rowsHash();
  cy.get("input[id=oldPassword]")
    .type(table["Your old password"])
    .get("input[id=newPassword]")
    .type(table["Your new passsword"])
    .get("input[id=confirmPassword]")
    .type(table["Confirm new password"]);
});

When("submit the form", () => {
  cy.get("form").submit();
});

Then("I cannot login anymore with password {string}", password => {
  cy.reload();
  const { email } = loginCredentials;
  cy.visit(`/login`);
  cy.get("input[name=email]")
    .trigger("focus")
    .type(email);
  cy.get("input[name=password]")
    .trigger("focus")
    .type(password);
  cy.get("button[name=submit]")
    .as("submitButton")
    .click();
  cy.get(".iziToast-wrapper").should(
    "contain",
    "Incorrect email address or password."
  );
});

Then("I can login successfully with password {string}", password => {
  cy.reload();
  cy.login({
    ...loginCredentials,
    ...{ password }
  });
  cy.get(".iziToast-wrapper").should("contain", "You are logged in!");
});

When("I log in with the following credentials:", table => {
  const { email, password } = table.hashes()[0];
  cy.login({ email, password });
});

When("open the notification menu and click on the first item", () => {
  cy.get(".notifications-menu").click();
  cy.get(".notification-mention-post")
    .first()
    .click();
});

Then("see {int} unread notifications in the top menu", count => {
  cy.get(".notifications-menu").should("contain", count);
});

Then("I get to the post page of {string}", path => {
  path = path.replace("...", "");
  cy.url().should("contain", "/post/");
  cy.url().should("contain", path);
});

When(
  "I start to write a new post with the title {string} beginning with:",
  (title, intro) => {
    cy.get(".post-add-button").click();
    cy.get('input[name="title"]').type(title);
    cy.get(".ProseMirror").type(intro);
  }
);

When("mention {string} in the text", mention => {
  cy.get(".ProseMirror").type(" @");
  cy.get(".suggestion-list__item")
    .contains(mention)
    .click();
  cy.debug();
});

Then("the notification gets marked as read", () => {
  cy.get(".notification")
    .first()
    .should("have.class", "read");
});

Then("there are no notifications in the top menu", () => {
  cy.get(".notifications-menu").should("contain", "0");
});
