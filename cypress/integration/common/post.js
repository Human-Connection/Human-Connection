import { When, Then } from 'cypress-cucumber-preprocessor/steps'

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
})

Then('the editor should be cleared', () => {
  cy.get('.ProseMirror p')
    .should('have.class', 'is-empty')
})
