import { When, Then } from 'cypress-cucumber-preprocessor/steps'

/* global cy */

const lastColumnIsSortedInDescendingOrder = () => {
  cy.get('tbody')
    .find('tr td:last-child')
    .then(lastColumn => {
      cy.wrap(lastColumn)
      const values = lastColumn
        .map((i, td) => parseInt(td.textContent))
        .toArray()
      const orderedDescending = values.slice(0).sort((a, b) => b - a)
      return cy.wrap(values).should('deep.eq', orderedDescending)
    })
}

When('I navigate to the administration dashboard', () => {
  cy.get('.avatar-menu').click()
  cy.get('.avatar-menu-popover a')
    .contains('Admin')
    .click()
})

Then('I can see a list of categories ordered by post count:', table => {
  // TODO: match the table in the feature with the html table
  cy.get('thead')
    .find('tr th')
    .should('have.length', 3)
  lastColumnIsSortedInDescendingOrder()
})

Then('I can see a list of tags ordered by user and post count:', table => {
  // TODO: match the table in the feature with the html table
  cy.get('thead')
    .find('tr th')
    .should('have.length', 4)
  lastColumnIsSortedInDescendingOrder()
})
