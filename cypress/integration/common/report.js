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
  cy.factory().create('user', {
    email: `${role}@example.org`,
    password: '1234',
    role
  })
  cy.login({
    email: `${role}@example.org`,
    password: '1234',
  })
})

When(
  'I click on "Report Contribution" from the triple dot menu of the post',
  () => {
    cy.contains('.ds-card', davidIrvingPostTitle)
      .find('.content-menu-trigger')
      .click()

    cy.get('.popover .ds-menu-item-link')
      .contains('Report Contribution')
      .click()
  }
)

When(
  'I click on "Report User" from the triple dot menu in the user info box',
  () => {
    cy.contains('.ds-card', davidIrvingName)
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
  //TODO: cy.get('.ds-modal').contains(davidIrvingPostTitle)
  cy.get('.ds-modal').within(() => {
    cy.get('button')
      .contains('Send Report')
      .click()
  })
})

Given('somebody reported the following posts:', table => {
  table.hashes().forEach(({slug}, index) => {
    const author =  {
        id: `author${index}`,
        email: `author${index}@example.org`,
        password: '1234'
    }
    const reporter =  {
        id: `reporter${index}`,
        email: `reporter${index}@example.org`,
        password: '1234'
    }
    cy.factory()
      .create('user', author)
      .authenticateAs(author)
      .create('post', { id: `p${index}` })
    cy.factory()
      .create('user', reporter)
      .authenticateAs(reporter)
      .create('report', { description: 'I don\'t like this post', resource: { id: `p${index}`, type: 'post' } })
  })
})

Then('I see all the reported posts including the one from above', () => {
  //TODO: match the right post
  cy.get('table tbody').within(() => {
    cy.contains('tr', davidIrvingPostTitle)
  })
})

Then('each list item links to the post page', () => {
  //TODO: match the right post
  cy.contains(davidIrvingPostTitle).click()
  cy.location('pathname').should('contain', '/post')
})
