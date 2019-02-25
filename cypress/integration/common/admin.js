import { When, Then } from 'cypress-cucumber-preprocessor/steps'

/* global cy */


When('I navigate to the administration dashboard', () => {
  cy.get('.avatar-menu').click()
  cy.get('.avatar-menu-popover')
    .find('a[href="/admin"]')
    .click()
})

Then('I can see a list of categories ordered by post count:', table => {
  // TODO: match the table in the feature with the html table
  cy.get('thead')
    .find('tr th')
    .should('have.length', 3)
  table.hashes().forEach(({Name, Posts}, index) => {
    cy.get(`tbody > :nth-child(${index + 1}) > :nth-child(2)`)
    .should('contain', Name)
    cy.get(`tbody > :nth-child(${index + 1}) > :nth-child(3)`)
    .should('contain', Posts)
  })
})

Then('I can see a list of tags ordered by user count:', table => {
  // TODO: match the table in the feature with the html table
  cy.get('thead')
    .find('tr th')
    .should('have.length', 4)
  table.hashes().forEach(({Name, Users, Posts}, index) => {
    cy.get(`tbody > :nth-child(${index + 1}) > :nth-child(2)`)
    .should('contain', Name)
    cy.get(`tbody > :nth-child(${index + 1}) > :nth-child(3)`)
    .should('contain', Users)
    cy.get(`tbody > :nth-child(${index + 1}) > :nth-child(4)`)
    .should('contain', Posts)
  })
})
