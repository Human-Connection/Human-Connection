import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'
import find from 'lodash/find'
import { eq } from 'semver';

/* global cy */

const baseUrl = 'http://localhost:3000'
const username = 'Peter Lustig'

const locales = require('../../../locales')

const getLangByName = function(name) {
  return find(locales, { name })
}

const openPage = function(page) {
  if (page === 'landing') {
    page = ''
  }
  cy.visit(`${baseUrl}/${page}`)
}

const switchLanguage = function(name) {
  cy.get('.login-locale-switch a').click()
  cy.contains('.locale-menu-popover a', name).click()
}

const login = (email, password) => {
  cy.visit(`${baseUrl}/login`)
  switchLanguage('English')
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

const lastColumnIsSortedInDescendingOrder = () => {
  cy.get('tbody')
    .find('tr td:last-child')
    .then(last_column => {
      cy.wrap(last_column)
      const values = last_column
        .map((i, td) => parseInt(td.textContent))
        .toArray()
      const ordered_descending = values.slice(0).sort((a, b) => b - a)
      return cy.wrap(values).should('deep.eq', ordered_descending)
    })
}

Given('I am logged in', () => {
  login('admin@example.org', 1234)
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


When('I log out', logout)

When('I visit the {string} page', page => {
  openPage(page)
})
Given('I am on the {string} page', page => {
  openPage(page)
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
  cy.get('.avatar-menu-popover')
})

Then('I can see my name {string} in the dropdown menu', () => {
  cy.get('.avatar-menu-popover').should('contain', username)
})

Then('I see the login screen again', () => {
  cy.location('pathname').should('contain', '/login')
  cy.contains('If you already have a human-connection account, login here.')
})

Then('I am still logged in', () => {
  cy.get('.avatar-menu').click()
  cy.get('.avatar-menu-popover').contains(username)
})

When('I select {string} in the language menu', name => {
  switchLanguage(name)
})
Given('I previously switched the language to {string}', name => {
  switchLanguage(name)
})
Then('the whole user interface appears in {string}', name => {
  const lang = getLangByName(name)
  cy.get(`html[lang=${lang.code}]`)
  cy.getCookie('locale').should('have.property', 'value', lang.code)
})
Then('I see a button with the label {string}', label => {
  cy.contains('button', label)
})

When('I navigate to the administration dashboard', () => {
  cy.get('.avatar-menu').click()
  cy.get('.avatar-menu-popover a')
    .contains('Admin')
    .click()
})

When(`I click on {string}`, linkOrButton => {
  cy.contains(linkOrButton).click()
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

When('I enter {string} as my location', location => {
  cy.get('input[id=city]').type(location)
  cy.get('.ds-select-option')
    .contains(location)
    .click()
})
When('I enter {string} to about me', text => {
  cy.get('textarea[id=bio]')
    .clear()
    .type(text)
})
When('save {string} as my new name', name => {
  cy.get('input[id=name]')
    .clear()
    .type(name)
  cy.contains('Save').click()
})
Then(
  'I can see my new name {string} when I click on my profile picture in the top right',
  name => {
    cy.get('input[id=name]')
      .clear()
      .type(name)
    cy.contains('Save').click()
})
When('I press {string}', label => {
  cy.contains(label).click()
})
Then('I can see a {string} as my location', location => {
  cy.contains(location)
})
Then('I can see a {string} as my about me', about => {
  cy.contains(about)
})
Then('I can see a {string} as my name', name => {
  cy.get('.avatar-menu-popover').contains(name)
})
