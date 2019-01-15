import { When, Then } from 'cypress-cucumber-preprocessor/steps'

/* global cy */

let aboutMeText
let myLocation
let myName

const matchNameInUserMenu = name => {
  cy.get('.avatar-menu').click() // open
  cy.get('.avatar-menu-popover').contains(name)
  cy.get('.avatar-menu').click() // close again
}

const setUserName = name => {
  cy.get('input[id=name]')
    .clear()
    .type(name)
  cy.contains('Save')
    .click()
    .wait(200)
  myName = name
}

When('I save {string} as my new name', name => {
  setUserName(name)
})

When('I save {string} as my location', location => {
  cy.get('input[id=city]').type(location)
  cy.get('.ds-select-option')
    .contains(location)
    .click()
  cy.contains('Save').click()
  myLocation = location
})

When('I have the following self-description:', text => {
  cy.get('textarea[id=bio]')
    .clear()
    .type(text)
  cy.contains('Save').click()
  aboutMeText = text
})

When('my username is {string}', name => {
  if (myName !== name) {
    setUserName(name)
  }
  matchNameInUserMenu(name)
})

When('people visit my profile page', url => {
  cy.visitMyProfile()
})

When('they can see the text in the info box below my avatar', () => {
  cy.contains(aboutMeText)
})

When('I changed my username to {string} previously', name => {
  myName = name
})

Then('they can see the location in the info box below my avatar', () => {
  matchNameInUserMenu(myName)
})

Then('my new username is still there', () => {
  matchNameInUserMenu(myName)
})

Then(
  'I can see my new name {string} when I click on my profile picture in the top right',
  name => matchNameInUserMenu(name)
)
