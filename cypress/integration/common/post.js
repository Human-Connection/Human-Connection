import { When, Then } from 'cypress-cucumber-preprocessor/steps'

const narratorAvatar = 'https://s3.amazonaws.com/uifaces/faces/twitter/nerrsoft/128.jpg'

Then('I click on the {string} button', text => {
  cy.get('button').contains(text).click()
})

Then('my comment should be successfully created', () => {
  cy.get('.iziToast-message')
    .contains('Comment Submitted')
})

Then('I should see my comment', () => {
  cy.get('div.comment p')
    .should('contain', 'Human Connection rocks')
    .get('.ds-avatar img')
    .should('have.attr', 'src')
    .and('contain', narratorAvatar)
})

Then('the editor should be cleared', () => {
  cy.get('.ProseMirror p')
    .should('have.class', 'is-empty')
})

Then('I rapidly double click on the {string} button', text => {
  cy.get('button').contains(text).click().click()
})

Then('I should see my comment once', () => {
  cy.get('div.comment p')
    .should('contain', 'Human Connection rocks')
    .and('have.length', 1)
    .get('.ds-avatar img')
    .should('have.attr', 'src')
    .and('contain', narratorAvatar)
    .and('have.length', 1)
})