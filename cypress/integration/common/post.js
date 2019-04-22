import { When, Then } from 'cypress-cucumber-preprocessor/steps'

When('I should be able to post a comment', () => {
  cy.get('.ProseMirror')
    .type('This is a comment')
    .get('.ds-form')
    .submit()
    .get('button')
    .contains('Submit Comment')
    .click()
    .get('.iziToast-message')
    .contains('Comment Submitted')
  })
  
Then('I should see my comment', () => {
  cy.get('div.comment p')
    .should('contain', 'This is a comment')
}) 
