import { When, Then } from 'cypress-cucumber-preprocessor/steps'

When('I search for {string}', value => {
  cy.get('#nav-search')
    .focus()
    .type(value)
})

Then('I should see posts with that word included', () => {
  cy.get('.ds-card-header:first').should('contain', 'Essays')
})

When('I type {string} and press Enter', value => {
  cy.get('#nav-search')
    .focus()
    .type(value)
    .type('{enter}')
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
  cy.get('a')
    .first()
    .trigger('click')
})

Then("I should be on the post's page", () => {
  cy.get('.hc-editor-content').should('contain', '101 Essays, of course!')
})

Then(
  'I should see posts with the searched-for term in the select dropdown',
  () => {
    cy.get('.ds-select-dropdown-message').should(
      'be.visible',
      '101 Essays that will change the way you think'
    )
  }
)

Then(
  'I should not see posts without the searched-for term in the select dropdown',
  () => {
    cy.get('.ds-select-dropdown-message').should(
      'not.be.visible',
      'No searched for content'
    )
  }
)
