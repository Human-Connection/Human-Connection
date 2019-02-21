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

import { getLangByName } from './helpers'
import users from '../fixtures/users.json'

const switchLang = name => {
  cy.get('.locale-menu').click()
  cy.contains('.locale-menu-popover a', name).click()
}

Cypress.Commands.add('switchLanguage', (name, force) => {
  const code = getLangByName(name).code
  if (force) {
    switchLang(name)
  } else {
    cy.get('html').then($html => {
      if ($html && $html.attr('lang') !== code) {
        switchLang(name)
      }
    })
  }
})

Cypress.Commands.add('login', ({email, password}) => {
  cy.visit(`/login`)
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

Cypress.Commands.add('loginAs', role => {
  role = role || 'admin'
  cy.login(users[role])
})

Cypress.Commands.add('logout', (email, password) => {
  cy.visit(`/logout`)
  cy.location('pathname').should('contain', '/login') // we're out
})

Cypress.Commands.add('openPage', page => {
  if (page === 'landing') {
    page = ''
  }
  cy.visit(`/${page}`)
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
