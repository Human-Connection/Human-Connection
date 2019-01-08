import { When, Then } from 'cypress-cucumber-preprocessor/steps'

/* global cy */

When('I save {string} as my new name', name => {
  cy.get('input[id=name]')
    .clear()
    .type(name)
  cy.contains('Save').click()
})

When('I save {string} as my location', location => {
  cy.get('input[id=city]').type(location)
  cy.get('.ds-select-option')
    .contains(location)
    .click()
  cy.contains('Save').click()
})

When('I save {string} to about me', text => {
  cy.get('textarea[id=bio]')
    .clear()
    .type(text)
  cy.contains('Save').click()
})

Then(
  'I can see my new name {string} when I click on my profile picture in the top right',
  name => {
    cy.get('input[id=name]')
      .clear()
      .type(name)
    cy.contains('Save').click()
  }
)

Then('I can see {string} as my location', location => {
  cy.contains(location)
})

Then('I can see a {string} as my about me', about => {
  cy.contains(about)
})

Then('I can see a {string} as my name', name => {
  cy.get('.avatar-menu-popover').contains(name)
})

