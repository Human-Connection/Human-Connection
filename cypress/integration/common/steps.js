import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'
import { getLangByName } from '../../support/helpers'

/* global cy  */

let lastPost = {}

const loginCredentials = {
  email: 'peterpan@example.org',
  password: '1234'
}
const narratorParams = {
  name: 'Peter Pan',
  ...loginCredentials
}

Given('I am logged in', () => {
  cy.login(loginCredentials)
})

Given('we have a selection of tags and categories as well as posts', () => {
  cy.factory()
    .authenticateAs(loginCredentials)
    .create('category', {
      id: 'cat1',
      name: 'Just For Fun',
      slug: 'justforfun',
      icon: 'smile'
    })
    .create('category', {
      id: 'cat2',
      name: 'Happyness & Values',
      slug: 'happyness-values',
      icon: 'heart-o'
    })
    .create('category', {
      id: 'cat3',
      name: 'Health & Wellbeing',
      slug: 'health-wellbeing',
      icon: 'medkit'
    })
    .create('tag', { id: 't1', name: 'Ecology' })
    .create('tag', { id: 't2', name: 'Nature' })
    .create('tag', { id: 't3', name: 'Democracy' })
    .create('post', { id: 'p0' })
    .create('post', { id: 'p1' })
    .create('post', { id: 'p2' })
    .relate('post', 'Categories', { from: 'p0', to: 'cat1' })
    .relate('post', 'Categories', { from: 'p1', to: 'cat2' })
    .relate('post', 'Categories', { from: 'p2', to: 'cat3' })
    .relate('post', 'Tags', { from: 'p0', to: 't1' })
    .relate('post', 'Tags', { from: 'p0', to: 't2' })
    .relate('post', 'Tags', { from: 'p0', to: 't3' })
    .relate('post', 'Tags', { from: 'p1', to: 't1' })
    .relate('post', 'Tags', { from: 'p1', to: 't2' })
})

Given('we have the following user accounts:', table => {
  table.hashes().forEach(params => {
    cy.factory().create('user', params)
  })
})

Given('I have a user account', () => {
  cy.factory().create('user', narratorParams)
})

Given('my user account has the role {string}', role => {
  cy.factory().create('user', {
    role,
    ...loginCredentials
  })
})

When('I log out', cy.logout)

When('I visit the {string} page', page => {
  cy.openPage(page)
})

Given('I am on the {string} page', page => {
  cy.openPage(page)
})

When('I fill in my email and password combination and click submit', () => {
  cy.login(loginCredentials)
})

When(/(?:when )?I refresh the page/, () => {
  cy.reload()
})

When('I log out through the menu in the top right corner', () => {
  cy.get('.avatar-menu').click()
  cy.get('.avatar-menu-popover')
    .find('a[href="/logout"]')
    .click()
})

Then('I can see my name {string} in the dropdown menu', () => {
  cy.get('.avatar-menu-popover').should('contain', narratorParams.name)
})

Then('I see the login screen again', () => {
  cy.location('pathname').should('contain', '/login')
})

Then('I can click on my profile picture in the top right corner', () => {
  cy.get('.avatar-menu').click()
  cy.get('.avatar-menu-popover')
})

Then('I am still logged in', () => {
  cy.get('.avatar-menu').click()
  cy.get('.avatar-menu-popover').contains(narratorParams.name)
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

Given('we have the following posts in our database:', table => {
  table.hashes().forEach(({ Author, id, title, content }) => {
    cy.factory()
      .create('user', {
        name: Author,
        email: `${Author}@example.org`,
        password: '1234'
      })
      .authenticateAs({
        email: `${Author}@example.org`,
        password: '1234'
      })
      .create('post', { id, title, content })
  })
})

Then('I see a success message:', message => {
  cy.contains(message)
})

When('I click on the avatar menu in the top right corner', () => {
  cy.get('.avatar-menu').click()
})

When(
  'I click on the big plus icon in the bottom right corner to create post',
  () => {
    cy.get('.post-add-button').click()
  }
)

Given('I previously created a post', () => {
  cy.factory()
    .authenticateAs(loginCredentials)
    .create('post', lastPost)
})

When('I choose {string} as the title of the post', title => {
  lastPost.title = title.replace('\n', ' ')
  cy.get('input[name="title"]').type(lastPost.title)
})

When('I type in the following text:', text => {
  lastPost.content = text.replace('\n', ' ')
  cy.get('.ProseMirror').type(lastPost.content)
})

Then('the post shows up on the landing page at position {int}', index => {
  cy.openPage('landing')
  const selector = `:nth-child(${index}) > .ds-card > .ds-card-content`
  cy.get(selector).should('contain', lastPost.title)
  cy.get(selector).should('contain', lastPost.content)
})

Then('I get redirected to {string}', route => {
  cy.location('pathname').should('contain', route)
})

Then('the post was saved successfully', () => {
  cy.get('.ds-card-header > .ds-heading').should('contain', lastPost.title)
  cy.get('.content').should('contain', lastPost.content)
})
