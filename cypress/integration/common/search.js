import { When, Then } from 'cypress-cucumber-preprocessor/steps'

When('I search for {string}', value => {
  cy.get('#nav-search')
    .focus()
    .type(value)
})

Then('I should see posts with that word included', () => {
  cy.get('.ds-card-header:first').should('contain', 'Essays')
})
