import { When, Then } from "cypress-cucumber-preprocessor/steps";
When("I search for {string}", value => {
  cy.get(".searchable-input .ds-select input")
    .focus()
    .type(value);
});

Then("I should have one item in the select dropdown", () => {
  cy.get(".searchable-input .ds-select-dropdown").should($li => {
    expect($li).to.have.length(1);
  });
});

Then("the search should not contain posts by the annoying user", () => {
  cy.get(".searchable-input .ds-select-dropdown").should($li => {
    expect($li).to.have.length(1);
  })
  cy.get(".ds-select-dropdown")
    .should("not.have.class", '.search-post')
    .should("not.contain", 'Spam')
});

Then("the search should contain the annoying user", () => {
  cy.get(".searchable-input .ds-select-dropdown").should($li => {
    expect($li).to.have.length(1);
  })
  cy.get(".ds-select-dropdown .user-teaser .slug").should("contain", '@spammy-spammer');
  cy.get(".searchable-input .ds-select input")
    .focus()
    .type("{esc}");
})

Then("I should see the following posts in the select dropdown:", table => {
  table.hashes().forEach(({ title }) => {
    cy.get(".ds-select-dropdown").should("contain", title);
  });
});

Then("I should see the following users in the select dropdown:", table => {
  cy.get(".search-heading").should("contain", "Users");
  table.hashes().forEach(({ slug }) => {
    cy.get(".ds-select-dropdown").should("contain", slug);
  });
});

When("I type {string} and press Enter", value => {
  cy.get(".searchable-input .ds-select input")
    .focus()
    .type(value)
    .type("{enter}", { force: true });
});

When("I type {string} and press escape", value => {
  cy.get(".searchable-input .ds-select input")
    .focus()
    .type(value)
    .type("{esc}");
});

Then("the search field should clear", () => {
  cy.get(".searchable-input .ds-select input").should("have.text", "");
});

When("I select a post entry", () => {
  cy.get(".searchable-input .search-post")
    .first()
    .trigger("click");
});

Then("I should be on the post's page", () => {
  cy.location("pathname").should("contain", "/post/");
  cy.location("pathname").should(
    "eq",
    "/post/p1/101-essays-that-will-change-the-way-you-think"
  );
});

Then(
  "I should see posts with the searched-for term in the select dropdown",
  () => {
    cy.get(".ds-select-dropdown").should(
      "contain",
      "101 Essays that will change the way you think"
    );
  }
);

Then("I should see the search results page", () => {
  cy.location("pathname").should(
    "eq",
    "/search/search-results"
  );
  cy.location("search").should(
    "eq",
    "?search=PR"
  );
});

Then("I should see the following posts on the search results page",
  () => {
    cy.get(".post-teaser").should(
      "contain",
      "101 Essays that will change the way you think"
    );
  }
);

Then(
  "I should not see posts without the searched-for term in the select dropdown",
  () => {
    cy.get(".ds-select-dropdown").should(
      "not.contain",
      "No searched for content"
    );
  }
);

Then("I select a user entry", () => {
  cy.get(".searchable-input .user-teaser")
    .first()
    .trigger("click");
})

Then("I should be on the user's profile", () => {
  cy.location("pathname").should("eq", "/profile/user-for-search/search-for-me")
})
