import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

const baseUrl = 'http://localhost:3000'
const username = 'Peter Lustig'

const login = (email, password) => {
  cy.visit(`${baseUrl}/login`)
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
}

const logout = () => {
  cy.visit(`${baseUrl}/logout`)
  cy.location('pathname').should('contain', '/login') // we're out
}

Given('I am logged in', () => {
  login('admin@example.org', 1234)
})

Given('my account has the following details:', table => {
  // as long as we rely on seed data, this is only documentation
})

When('I log out', logout)

When(`I visit the {string} page`, route => {
  cy.visit(`${baseUrl}/${route}`)
})

When('I fill in my email and password combination and click submit', () => {
  login('admin@example.org', 1234)
})

When('I refresh the page', () => {
  cy.reload()
})

When('I log out through the menu in the top right corner', () => {
  cy.get('.avatar-menu').click()
  cy.get('.avatar-menu-popover')
    .find('a')
    .contains('Logout')
    .click()
})

Then('I can click on my profile picture in the top right corner', () => {
  cy.get('.avatar-menu').click()
})

Then('I can see my name {string} in the dropdown menu', () => {
  cy.get('.avatar-menu-popover').should('contain', username)
})

Then('I see the login screen again', () => {
  cy.location('pathname').should('contain', '/login')
  cy.contains(
    'Wenn Du ein Konto bei Human Connection hast, melde Dich bitte hier an.'
  )
})

Then('I am still logged in', () => {
  cy.get('.avatar-menu').click()
  cy.get('.avatar-menu-popover').contains(username)
})
