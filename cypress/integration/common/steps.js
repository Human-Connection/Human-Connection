import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'
import { getLangByName } from '../../support/helpers'
import users from '../../fixtures/users.json'

/* global cy  */

const openPage = page => {
  if (page === 'landing') {
    page = ''
  }
  cy.visit(`/${page}`)
}

Given('I am logged in', () => {
  cy.loginAs('admin')
})
Given('I am logged in as {string}', userType => {
  cy.loginAs(userType)
})

Given('we have a selection of tags and categories as well as posts', () => {
  // TODO: use db factories instead of seed data
})

Given('my account has the following details:', table => {
  // TODO: use db factories instead of seed data
})

Given('my user account has the role {string}', role => {
  // TODO: use db factories instead of seed data
})

When('I log out', cy.logout)

When('I visit the {string} page', page => {
  openPage(page)
})
Given('I am on the {string} page', page => {
  openPage(page)
})

When('I fill in my email and password combination and click submit', () => {
  cy.login('admin@example.org', 1234)
})

When('I refresh the page', () => {
  cy.reload()
})

When('I log out through the menu in the top right corner', () => {
  cy.get('.avatar-menu').click()
  cy.get('.avatar-menu-popover')
    .find('a[href="/logout"]')
    .click()
})

Then('I can click on my profile picture in the top right corner', () => {
  cy.get('.avatar-menu').click()
  cy.get('.avatar-menu-popover')
})

Then('I can see my name {string} in the dropdown menu', () => {
  cy.get('.avatar-menu-popover').should('contain', users.admin.name)
})

Then('I see the login screen again', () => {
  cy.location('pathname').should('contain', '/login')
})

Then('I am still logged in', () => {
  cy.get('.avatar-menu').click()
  cy.get('.avatar-menu-popover').contains(users.admin.name)
})

When('I select {string} in the language menu', name => {
  cy.switchLanguage(name, true)
})
Given('I previously switched the language to {string}', name => {
  cy.switchLanguage(name, true)
})
Then('the whole user interface appears in {string}', name => {
  const lang = getLangByName(name)
  cy.get(`html[lang=${lang.code}]`)
  cy.getCookie('locale').should('have.property', 'value', lang.code)
})
Then('I see a button with the label {string}', label => {
  cy.contains('button', label)
})

When(`I click on {string}`, linkOrButton => {
  cy.contains(linkOrButton).click()
})

When('I press {string}', label => {
  cy.contains(label).click()
})
