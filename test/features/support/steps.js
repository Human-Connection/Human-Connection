// features/support/steps.js
import { Given, When, Then, AfterAll } from 'cucumber'
import { expect } from 'chai'
// import { client } from '../../../src/activitypub/apollo-client'
import { GraphQLClient } from 'graphql-request'
import Factory from '../../../src/seed/factories'
import { host } from '../../../src/jest/helpers'
const debug = require('debug')('ea:test:steps')

const factory = Factory()
const client = new GraphQLClient(host)

function createUser (slug) {
  debug(`creating user ${slug}`)
  return factory.create('User', {
    name: slug,
    email: 'example@test.org',
    password: '1234'
  })
  // await login({ email: 'example@test.org', password: '1234' })
}

AfterAll('Clean up the test data', function () {
  debug('All the tests are done! Deleting test data')
  return factory.cleanDatabase()
})

Given('our own server runs at {string}', function (string) {
  // just documenation
})

Given('we have the following users in our database:', function (dataTable) {
  return Promise.all(dataTable.hashes().map((user) => {
    return createUser(user.Slug)
  }))
})

When('I send a GET request to {string}', async function (pathname) {
  const response = await this.get(pathname)
  this.lastContentType = response.lastContentType

  this.lastResponses.push(response.lastResponse)
  this.statusCode = response.statusCode
})

When('I send a POST request with the following activity to {string}:', async function (inboxUrl, activity) {
  debug(`inboxUrl = ${inboxUrl}`)
  debug(`activity = ${activity}`)
  const splitted = inboxUrl.split('/')
  const slug = splitted[splitted.indexOf('users') + 1]
  let result
  do {
    result = await client.request(`
    query {
      User(slug: "${slug}") {
        id
        slug
        actorId
      }
    }
    `)
  } while (result.User.length === 0)
  this.lastInboxUrl = inboxUrl
  this.lastActivity = activity
  const response = await this.post(inboxUrl, activity)

  this.lastResponses.push(response.lastResponse)
  this.lastResponse = response.lastResponse
  this.statusCode = response.statusCode
})

Then('I receive the following json:', function (docString) {
  const parsedDocString = JSON.parse(docString)
  const parsedLastResponse = JSON.parse(this.lastResponses.shift())
  if (Array.isArray(parsedDocString.orderedItems)) {
    parsedDocString.orderedItems.forEach((el) => {
      delete el.id
      if (el.object) delete el.object.published
    })
    parsedLastResponse.orderedItems.forEach((el) => {
      delete el.id
      if (el.object) delete el.object.published
    })
  }
  if (parsedDocString.publicKey && parsedDocString.publicKey.publicKeyPem) {
    delete parsedDocString.publicKey.publicKeyPem
    delete parsedLastResponse.publicKey.publicKeyPem
  }
  expect(parsedDocString).to.eql(parsedLastResponse)
})

Then('I expect the Content-Type to be {string}', function (contentType) {
  expect(this.lastContentType).to.equal(contentType)
})

Then('I expect the status code to be {int}', function (statusCode) {
  expect(this.statusCode).to.equal(statusCode)
})

Then('the activity is added to the {string} collection', async function (collectionName) {
  const response = await this.get(this.lastInboxUrl.replace('inbox', collectionName) + '?page=true')
  debug(`orderedItems = ${JSON.parse(response.lastResponse).orderedItems}`)
  expect(JSON.parse(response.lastResponse).orderedItems).to.include(JSON.parse(this.lastActivity).object)
})

Then('the follower is added to the followers collection of {string}', async function (userName, follower) {
  const response = await this.get(`/activitypub/users/${userName}/followers?page=true`)
  const responseObject = JSON.parse(response.lastResponse)
  expect(responseObject.orderedItems).to.include(follower)
})

Then('the follower is removed from the followers collection of {string}', async function (userName, follower) {
  const response = await this.get(`/activitypub/users/${userName}/followers?page=true`)
  const responseObject = JSON.parse(response.lastResponse)
  expect(responseObject.orderedItems).to.not.include(follower)
})

Then('the post with id {string} to be created', async function (id) {
  let result
  do {
    result = await client.request(`
      query {
          Post(id: "${id}") {
              title
          }
      }
   `)
  } while (result.Post.length === 0)

  expect(result.Post).to.be.an('array').that.is.not.empty // eslint-disable-line
})

Then('the object is removed from the outbox collection of {string}', async function (name, object) {
  const response = await this.get(`/activitypub/users/${name}/outbox?page=true`)
  const parsedResponse = JSON.parse(response.lastResponse)
  expect(parsedResponse.orderedItems).to.not.include(object)
})

Then('I send a GET request to {string} and expect a ordered collection', () => {

})

Then('the activity is added to the users inbox collection', async function () {

})

Then('the post with id {string} has been liked by {string}', async function (id, slug) {
  let result
  do {
    result = await client.request(`
    query {
      Post(id: "${id}") {
        shoutedBy {
          slug
        }
      }
    }
  `)
  } while (result.Post.length === 0)

  expect(result.Post[0].shoutedBy).to.be.an('array').that.is.not.empty // eslint-disable-line
  expect(result.Post[0].shoutedBy[0].slug).to.equal(slug)
})
