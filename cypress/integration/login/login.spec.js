/// <reference types="Cypress" />

const loginTestUser = function () {
  // Visiting our app before each test removes any state build up from
  cy.visit('http://localhost:3000/')
    .get('.layout-blank')
    .should('be.visible')

  cy.location('pathname')
    .should('contain', '/login')

  cy.get('input[name=email]')
    .as('inputEmail')
    .should('be.empty')
    .and('have.attr', 'placeholder', 'Deine E-Mail')
    .trigger('focus')
    .type('user@example.org')

  cy.get('input[name=password]')
    .as('inputPassword')
    .should('be.empty')
    // .and('have.attr', 'placeholder', 'Dein Passwort')
    .trigger('focus')
    .type('1234')

  cy.get('button[name=submit]')
    .as('submitButton')
    .should('be.visible')
    .and('not.be.disabled')
    .click()

  cy.get('@submitButton')
    .should('be.disabled')
    // .next('.snackbar')

  cy.get('.layout-default')

  cy.location('pathname')
    .should('eq', '/')
}

const logout = function () {
  cy.visit('http://localhost:3000/logout')

  cy.location('pathname')
    .should('contain', '/login')

  cy.get('.layout-blank')
    .should('be.visible')
}

context('Authentication', () => {
  it('Login Testuser', loginTestUser)

  it('Login & Logout', function () {
    // login
    loginTestUser()

    // logout
    logout()
  })

  it('Still logged in after page-reload', function () {
    // login
    loginTestUser()

    cy.reload()
      .get('.layout-default')

    // logout
    // logout()
  })
})
