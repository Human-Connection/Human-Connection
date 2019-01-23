import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

/* global cy  */

let lastReportTitle
let dummyReportedPostTitle = 'Hacker, Freaks und Funktionäre'
let dummyReportedPostSlug = 'hacker-freaks-und-funktionareder-ccc'
let dummyAuthorName = 'Jenny Rostock'

const savePostTitle = $post => {
  return $post
    .first()
    .find('.ds-heading')
    .first()
    .invoke('text')
    .then(title => {
      lastReportTitle = title
    })
}

Given("I see David Irving's post on the landing page", page => {
  cy.openPage('landing')
})

Given("I see David Irving's post on the post page", page => {
  cy.visit(`/post/${dummyReportedPostSlug}`)
  cy.contains(dummyReportedPostTitle) // wait
})

Given('I am logged in with a {string} role', role => {
  cy.loginAs(role)
})

When(
  'I click on "Report Contribution" from the triple dot menu of the post',
  () => {
    //TODO: match the created post title, not a dummy post title
    cy.contains('.ds-card', dummyReportedPostTitle)
      .find('.content-menu-trigger')
      .first()
      .click()

    cy.get('.popover .ds-menu-item-link')
      .contains('Report Contribution')
      .click()
  }
)

When(
  'I click on "Report User" from the triple dot menu in the user info box',
  () => {
    //TODO: match the created post author, not a dummy author
    cy.contains('.ds-card', dummyAuthorName)
      .find('.content-menu-trigger')
      .first()
      .click()

    cy.get('.popover .ds-menu-item-link')
      .contains('Report User')
      .click()
  }
)

When('I click on the author', () => {
  cy.get('a.author')
    .first()
    .click()
    .wait(200)
})

When('I report the author', () => {
  cy.get('.page-name-profile-slug').then(() => {
    invokeReportOnElement('.ds-card').then(() => {
      cy.get('button')
        .contains('Send')
        .click()
    })
  })
})

When('I click on send in the confirmation dialog', () => {
  cy.get('button')
    .contains('Send')
    .click()
})

Then('I get a success message', () => {
  cy.get('.iziToast-message').contains('Thanks')
})

Then('I see my reported user', () => {
  cy.get('table').then(() => {
    cy.get('tbody tr')
      .first()
      .contains(lastReportTitle.trim())
  })
})

Then(`I can't see the moderation menu item`, () => {
  cy.get('.avatar-menu-popover')
    .find('a[href="/settings"]', 'Settings')
    .should('exist') // OK, the dropdown is actually open

  cy.get('.avatar-menu-popover')
    .find('a[href="/moderation"]', 'Moderation')
    .should('not.exist')
})

When(/^I confirm the reporting dialog .*:$/, () => {
  //TODO: take message from method argument
  //TODO: match the right post
  const message = 'Do you really want to report the'
  cy.contains(message) // wait for element to become visible
  //TODO: cy.get('.ds-modal').contains(dummyReportedPostTitle)
  cy.get('.ds-modal').within(() => {
    cy.get('button')
      .contains('Send Report')
      .click()
  })
})

Given('somebody reported the following posts:', table => {
  table.hashes().forEach(row => {
    //TODO: calll factory here
    // const options = Object.assign({}, row, { reported: true })
    //create('post', options)
  })
})

Then('I see all the reported posts including the one from above', () => {
  //TODO: match the right post
  cy.get('table tbody').within(() => {
    cy.contains('tr', dummyReportedPostTitle)
  })
})

Then('each list item links to the post page', () => {
  //TODO: match the right post
  cy.contains(dummyReportedPostTitle).click()
  cy.location('pathname').should('contain', '/post')
})
