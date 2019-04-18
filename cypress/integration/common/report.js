import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

/* global cy  */

let lastReportTitle
let davidIrvingPostTitle = 'The Truth about the Holocaust'
let davidIrvingPostSlug = 'the-truth-about-the-holocaust'
let davidIrvingName = 'David Irving'

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
  cy.visit(`/post/${davidIrvingPostSlug}`)
  cy.contains(davidIrvingPostTitle) // wait
})

Given('I am logged in with a {string} role', role => {
  cy.factory().create('User', {
    email: `${role}@example.org`,
    password: '1234',
    role
  })
  cy.login({
    email: `${role}@example.org`,
    password: '1234'
  })
})

When('I click on "Report Post" from the content menu of the post', () => {
  cy.contains('.ds-card', davidIrvingPostTitle)
    .find('.content-menu-trigger')
    .click({force: true})

  cy.get('.popover .ds-menu-item-link')
    .contains('Report Post')
    .click()
})

When(
  'I click on "Report User" from the content menu in the user info box',
  () => {
    // wait client-side-rendered content
    cy.get('.ds-card-content .content-menu button').should('exist')

    cy.contains('.ds-card-content', davidIrvingName)
      .find('.content-menu button').click()

    cy.get('.popover .ds-menu-item-link')
      .contains('Report User')
      .click()
  }
)

When('I click on the author', () => {
  cy.get('a.user')
    .first()
    .click()
    .wait(200)
})

When('I report the author', () => {
  cy.get('.page-name-profile-id-slug').then(() => {
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

When(/^I confirm the reporting dialog .*:$/, message => {
  cy.contains(message) // wait for element to become visible
  cy.get('.ds-modal').within(() => {
    cy.get('button')
      .contains('Report')
      .click()
  })
})

Given('somebody reported the following posts:', table => {
  table.hashes().forEach(({ id }) => {
    const submitter = {
      email: `submitter${id}@example.org`,
      password: '1234'
    }
    cy.factory()
      .create('User', submitter)
      .authenticateAs(submitter)
      .create('Report', {
        id,
        description: 'Offensive content'
      })
  })
})

Then('I see all the reported posts including the one from above', () => {
  cy.get('table tbody').within(() => {
    cy.contains('tr', davidIrvingPostTitle)
  })
})

Then('each list item links to the post page', () => {
  cy.contains(davidIrvingPostTitle).click()
  cy.location('pathname').should('contain', '/post')
})
