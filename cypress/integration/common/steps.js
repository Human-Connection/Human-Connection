import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import helpers from "../../support/helpers";

/* global cy  */

let lastPost = {};

let loginCredentials = {
  email: "peterpan@example.org",
  password: "1234"
};
const narratorParams = {
  id: 'id-of-peter-pan',
  name: "Peter Pan",
  slug: "peter-pan",
  avatar: "https://s3.amazonaws.com/uifaces/faces/twitter/nerrsoft/128.jpg",
  ...loginCredentials
};

Given("I am logged in", () => {
  cy.login(loginCredentials);
});

Given("we have a selection of categories", () => {
  cy.createCategories("cat0", "just-for-fun");
});

Given("we have a selection of tags and categories as well as posts", () => {
  cy.createCategories("cat12")
    .factory()
    .create("Tag", { id: "Ecology" })
    .create("Tag", { id: "Nature" })
    .create("Tag", { id: "Democracy" });

  cy.factory()
    .create("User", { id: 'a1' })
    .create("Post", {authorId: 'a1', tagIds: [ "Ecology", "Nature", "Democracy" ], categoryIds: ["cat12"] })
    .create("Post", {authorId: 'a1', tagIds: [ "Nature", "Democracy" ], categoryIds: ["cat121"] });

  cy.factory()
    .create("User", { id: 'a2'})
    .create("Post", { authorId: 'a2', tagIds: ['Nature', 'Democracy'], categoryIds: ["cat12"] });
  cy.factory()
    .create("Post", { authorId: narratorParams.id, tagIds: ['Democracy'], categoryIds: ["cat122"] })
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
  const { code } = helpers.getLangByName(name);
  cy.get(`html[lang=${code}]`);
  cy.getCookie("locale").should("have.property", "value", code);
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

Given("we have this user in our database:", table => {
  const [firstRow] = table.hashes()
  cy.factory().create('User', firstRow)
})

Given("we have the following posts in our database:", table => {
  cy.factory().create('Category', {
    id: `cat-456`,
    name: "Just For Fun",
    slug: `just-for-fun`,
    icon: "smile"
  })

  table.hashes().forEach(({ ...postAttributes }, i) => {
    postAttributes = {
      ...postAttributes,
      deleted: Boolean(postAttributes.deleted),
      disabled: Boolean(postAttributes.disabled),
      categoryIds: ['cat-456']
    }
    cy.factory().create("Post", postAttributes);
  })
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
  lastPost.authorId = narratorParams.id
  lastPost.title = "previously created post";
  lastPost.content = "with some content";
  lastPost.categoryIds = ["cat0"];
  cy.factory()
    .create("Post", lastPost);
});

When("I choose {string} as the title of the post", title => {
  lastPost.title = title.replace("\n", " ");
  cy.get('input[name="title"]').type(lastPost.title);
});

When("I type in the following text:", text => {
  lastPost.content = text.replace("\n", " ");
  cy.get(".editor .ProseMirror").type(lastPost.content);
});

Then("I select a category", () => {
  cy.get("span")
    .contains("Just for Fun")
    .click();
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
    cy.request({ url: route, failOnStatusCode: false })
      .its("status")
      .should("eq", 404);
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
    .get("input[id=password]")
    .type(table["Your new passsword"])
    .get("input[id=passwordConfirmation]")
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
  cy.get(".notifications-menu-popover .notification")
    .first()
    .should("have.class", "read");
});

Then("there are no notifications in the top menu", () => {
  cy.get(".notifications-menu").should("contain", "0");
});

Given("there is an annoying user called {string}", name => {
  const annoyingParams = {
    email: "spammy-spammer@example.org",
    password: "1234"
  };
  cy.factory().create("User", {
    ...annoyingParams,
    id: "annoying-user",
    name
  });
});

Given("I am on the profile page of the annoying user", name => {
  cy.openPage("/profile/annoying-user/spammy-spammer");
});

When("I visit the profile page of the annoying user", name => {
  cy.openPage("/profile/annoying-user");
});

When("I ", name => {
  cy.openPage("/profile/annoying-user");
});

When(
  "I click on {string} from the content menu in the user info box",
  button => {
    cy.get(".user-content-menu .content-menu-trigger").click();
    cy.get(".popover .ds-menu-item-link")
      .contains(button)
      .click({ force: true });
  }
);

When("I navigate to my {string} settings page", settingsPage => {
  cy.get(".avatar-menu").click();
  cy.get(".avatar-menu-popover")
    .find("a[href]")
    .contains("Settings")
    .click();
  cy.contains(".ds-menu-item-link", settingsPage).click();
});

Given("I follow the user {string}", name => {
  cy.neode()
    .first("User", { name })
    .then(followed => {
      cy.neode()
        .first("User", { name: narratorParams.name })
        .relateTo(followed, "following");
    });
});

Given('"Spammy Spammer" wrote a post {string}', title => {
  cy.createCategories("cat21")
    .factory()
    .create("Post", { authorId: 'annoying-user', title, categoryIds: ["cat21"] });
});

Then("the list of posts of this user is empty", () => {
  cy.get(".ds-card-content").not(".post-link");
  cy.get(".main-container").find(".ds-space.hc-empty");
});

Then("nobody is following the user profile anymore", () => {
  cy.get(".ds-card-content").not(".post-link");
  cy.get(".main-container").contains(
    ".ds-card-content",
    "is not followed by anyone"
  );
});

Given("I wrote a post {string}", title => {
  cy.createCategories(`cat213`, title)
    .factory()
    .create("Post", { authorId: narratorParams.id, title, categoryIds: ["cat213"] });
});

When("I block the user {string}", name => {
  cy.neode()
    .first("User", { name })
    .then(blocked => {
      cy.neode()
        .first("User", { name: narratorParams.name })
        .relateTo(blocked, "blocked");
    });
});

When("I log in with:", table => {
  const [firstRow] = table.hashes();
  const { Email, Password } = firstRow;
  cy.login({ email: Email, password: Password });
});

Then("I see only one post with the title {string}", title => {
  cy.get(".main-container")
    .find(".post-link")
    .should("have.length", 1);
  cy.get(".main-container").contains(".post-link", title);
});
