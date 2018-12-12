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

Given('we have a selection of tags and categories as well as posts', () => {
  // TODO: use db factories instead of seed data
})

Given('my account has the following details:', (table) => {
  // TODO: use db factories instead of seed data
})

Given('my user account has the role {string}', (role) => {
  // TODO: use db factories instead of seed data
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

When('I navigate to the administration dashboard', () => {
  cy.get('.avatar-menu').click()
  cy.get('a').contains('Systemverwaltung').click()
})

When(`I click on {string}`, (link) => {
  cy.contains(link).click()
})

Then('I can see a list of categories ordered by post count:', (table) => {
  // TODO: match the table in the feature with the html table
  cy.get('thead').find('tr th').should('have.length', 3)
  const last_column = cy.get('tbody').find('tr td:last-child').then((last_column) => {
    cy.wrap(last_column)
    const values = last_column.map((i, td) => parseInt(td.textContent)).toArray()
    const ordered_descending = values.slice(0).sort((a,b) => b - a)
    return cy.wrap(values).should('deep.eq', ordered_descending)
  })
})
