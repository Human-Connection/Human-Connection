import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'
import { VERSION } from '../../constants/terms-and-conditions-version.js'
import { gql } from '../../../backend/src/helpers/jest'

/* global cy  */

let lastReportTitle
let davidIrvingPostTitle = 'The Truth about the Holocaust'
let davidIrvingPostSlug = 'the-truth-about-the-holocaust'
let annoyingUserWhoMutedModeratorTitle = 'Fake news'

const savePostTitle = $post => {
  return $post
    .first()
    .find('.title')
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
  cy.factory().build('user', {
    termsAndConditionsAgreedVersion: VERSION,
    role,
    name: `${role} is my name`
  }, {
    email: `${role}@example.org`,
    password: '1234',
  })
  cy.neode()
    .first("User", {
      name: `${role} is my name`,
    })
    .then(user => {
      return new Cypress.Promise((resolve, reject) => {
        return user.toJson().then((user) => resolve(user))
      })
    })
    .then(user => cy.login(user))
})

When('I click on "Report Post" from the content menu of the post', () => {
  cy.contains('.base-card', davidIrvingPostTitle)
    .find('.content-menu .base-button')
    .click({force: true})

  cy.get('.popover .ds-menu-item-link')
    .contains('Report Post')
    .click()
})

When('I click on "Report User" from the content menu in the user info box', () => {
  cy.contains('.base-card', davidIrvingPostTitle)
    .get('.user-content-menu .base-button')
    .click({ force: true })

  cy.get('.popover .ds-menu-item-link')
    .contains('Report User')
    .click()
})

When('I click on the author', () => {
  cy.get('.user-teaser')
    .click()
    .url().should('include', '/profile/')
})

When('I report the author', () => {
  cy.get('.page-name-profile-id-slug').then(() => {
    invokeReportOnElement('.base-card').then(() => {
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
    cy.get('.ds-radio-option-label')
      .first()
      .click({
        force: true
      })
    cy.get('button')
      .contains('Report')
      .click()
  })
})

Given('somebody reported the following posts:', table => {
  table.hashes().forEach(({ submitterEmail, resourceId, reasonCategory, reasonDescription }) => {
    const submitter = {
      email: submitterEmail,
      password: '1234'
    }
    cy.factory()
      .build('user', {}, submitter)
      .authenticateAs(submitter)
      .mutate(gql`mutation($resourceId: ID!, $reasonCategory: ReasonCategory!, $reasonDescription: String!) {
        fileReport(resourceId: $resourceId, reasonCategory: $reasonCategory, reasonDescription: $reasonDescription) {
          reportId
        }
      }`, {
        resourceId,
        reasonCategory,
        reasonDescription
      })
  })
})

Then('I see all the reported posts including the one from above', () => {
  cy.get('table tbody').within(() => {
    cy.contains('tr', davidIrvingPostTitle)
  })
})

Then('I see all the reported posts including from the user who muted me', () => {
  cy.get('table tbody').within(() => {
    cy.contains('tr', annoyingUserWhoMutedModeratorTitle)
  })
})

Then('each list item links to the post page', () => {
  cy.contains(davidIrvingPostTitle).click()
  cy.location('pathname').should('contain', '/post')
})

Then('I can visit the post page', () => {
  cy.contains(annoyingUserWhoMutedModeratorTitle).click()
  cy.location('pathname').should('contain', '/post')
    .get('.base-card .title').should('contain', annoyingUserWhoMutedModeratorTitle)
})

When("they have a post someone has reported", () => {
  cy.factory()
    .build("post", {
      title,
    }, {
      authorId: 'annnoying-user',
    });
})
