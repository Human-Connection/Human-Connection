// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

/* globals Cypress cy */

import { baseUrl } from './config'

Cypress.Commands.add('switchLanguage', lang => {
  cy.get('.login-locale-switch a').click()
  cy.contains('.locale-menu-popover a', lang).click()
})

Cypress.Commands.add('login', (email, password) => {
  cy.visit(`${baseUrl}/login`)
  cy.switchLanguage('English')
  cy.get('input[name=email]')
    .trigger('focus')
    .type(email)
  cy.get('input[name=password]')
    .trigger('focus')
    .type(password)
  cy.get('button[name=submit]')
    .as('submitButton')
    .click()
  cy.location('pathname').should('eq', '/') // we're in!
})
Cypress.Commands.add('logout', (email, password) => {
  cy.visit(`${baseUrl}/logout`)
  cy.location('pathname').should('contain', '/login') // we're out
})

//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
