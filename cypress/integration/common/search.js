import { When, Then } from 'cypress-cucumber-preprocessor/steps'
When('I search for {string}', value => {
  cy.get('#nav-search')
    .focus()
    .type(value)
})

Then('I should have one post in the select dropdown', () => {
  cy.get('.ds-select-dropdown').should($li => {
    expect($li).to.have.length(1)
  })
})

Then('I should see the following posts in the select dropdown:', table => {
  table.hashes().forEach(({ title }) => {
    cy.get('.ds-select-dropdown').should('contain', title)
  })
})

When('I type {string} and press Enter', value => {
  cy.get('#nav-search')
    .focus()
    .type(value)
    .type('{enter}', { force: true })
})

When('I type {string} and press escape', value => {
  cy.get('#nav-search')
    .focus()
    .type(value)
    .type('{esc}')
})

Then('the search field should clear', () => {
  cy.get('#nav-search').should('have.text', '')
})

When('I select an entry', () => {
  cy.get('.ds-select-dropdown ul li')
    .first()
    .trigger('click')
})

Then("I should be on the post's page", () => {
  cy.location('pathname').should(
    'eq',
    '/post/101-essays-that-will-change-the-way-you-think/'
  )
})

Then(
  'I should see posts with the searched-for term in the select dropdown',
  () => {
    cy.get('.ds-select-dropdown').should(
      'contain',
      '101 Essays that will change the way you think'
    )
  }
)

Then(
  'I should not see posts without the searched-for term in the select dropdown',
  () => {
    cy.get('.ds-select-dropdown').should(
      'not.contain',
      'No searched for content'
    )
  }
)
