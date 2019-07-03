import { When, Then } from 'cypress-cucumber-preprocessor/steps'

/* global cy */

When('I navigate to the administration dashboard', () => {
  cy.get('.avatar-menu').click()
  cy.get('.avatar-menu-popover')
    .find('a[href="/admin"]')
    .click()
})

Then('I can see the following table:', table => {
  const headers = table.raw()[0]
  headers.forEach((expected, i) => {
    cy.get('thead th').eq(i).should('contain', expected)
  })
  const flattened = [].concat.apply([], table.rows())
  flattened.forEach((expected, i) => {
    cy.get('tbody td').eq(i).should('contain', expected)
  })
})
