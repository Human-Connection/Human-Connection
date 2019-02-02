import { When, Then } from 'cypress-cucumber-preprocessor/steps'

When('I search for a specific word', () => {
  cy.get('#nav-search').type('Essays')
})

Then('I should see posts with that word included', () => {
  cy.get('.ds-card-header:first').then(() => {
    cy.title().should('include', 'Essays')
  })
})
