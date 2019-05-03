// features/support/steps.js
import { Given, When, Then, BeforeAll } from 'cucumber'
import { expect } from 'chai'
import { GraphQLClient } from 'graphql-request'
import Factory from '../../../src/seed/factories'
import { host } from '../../../src/jest/helpers'

const factory = Factory()
const client = new GraphQLClient(host)
// setDefaultTimeout(60 * 1000)

async function createUser (slug) {
  const result = await client.request(`
    query {
      User(slug: "${slug}") {
        slug
      }
    }
  `)
  if (result.User.length === 0) {
    return factory.create('User', {
      name: slug,
      email: 'example@test.org',
      password: '1234',
      actorId: `http://localhost:3000/api/users/${slug}`
    })
  }
  // await login({ email: 'example@test.org', password: '1234' })
}

BeforeAll('Clean Database for fresh test setup', async function () {
  await factory.cleanDatabase()
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
  this.lastInboxUrl = inboxUrl
  this.lastActivity = activity
  const response = await this.post(inboxUrl, activity)

  this.lastResponse = response.lastResponse
  this.statusCode = response.statusCode
})

Then('I receive the following json:', function (docString) {
  const parsedDocString = JSON.parse(docString)
  let parsedLastResponse = null
  if (this.lastResponses.length > 0) {
    parsedLastResponse = JSON.parse(this.lastResponses.shift())
  } else {
    parsedLastResponse = JSON.parse(this.lastResponse)
  }

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
  if (parsedLastResponse.orderedItems) {
    parsedLastResponse.orderedItems.map((item) => {
      if (item.type === 'Update') {
        if ('updated' in item.object) {
          delete item.object.updated
          delete item.object.updated
        } else {
          expect(true).to.equal(false)
        }
      }
    })
  }
  expect(parsedLastResponse).to.eql(parsedDocString)
})

Then('I expect the Content-Type to be {string}', function (contentType) {
  expect(this.lastContentType).to.equal(contentType)
})

Then('I expect the status code to be {int}', function (statusCode) {
  expect(this.statusCode).to.equal(statusCode)
})

Then('the activity is added to the {string} collection', async function (collectionName) {
  const response = await this.get(this.lastInboxUrl.replace('inbox', collectionName) + '?page=true')
  expect(JSON.parse(response.lastResponse).orderedItems).to.include(JSON.parse(this.lastActivity).object)
})

Then('the follower is added to the followers collection of {string}', async function (userName, follower) {
  const response = await this.get(`/users/${userName}/followers?page=true`)
  const responseObject = JSON.parse(response.lastResponse)
  expect(responseObject.orderedItems).to.include(follower)
})

Then('the follower is removed from the followers collection of {string}', async function (userName, follower) {
  const response = await this.get(`/users/${userName}/followers?page=true`)
  const responseObject = JSON.parse(response.lastResponse)
  expect(responseObject.orderedItems).to.not.include(follower)
})

Then('the post with id {string} to be created', async function (id) {
  let result = await getPost(id)
  expect(result.Post).to.be.an('array').that.is.not.empty // eslint-disable-line
})

Then('the post with id {string} to be deleted', async function (id) {
  const result = await getPost(id)
  expect(result.Post).to.be.an('array').that.is.empty // eslint-disable-line
})

Then('the object is removed from the outbox collection of {string}', async function (name, object) {
  const response = await this.get(`/users/${name}/outbox?page=true`)
  const parsedResponse = JSON.parse(response.lastResponse)
  expect(parsedResponse.orderedItems).to.not.include(object)
})

Then('the post with id {string} has been liked by {string}', async function (id, slug) {
  let shoutedBy = await getPostShoutedBy(id)

  expect(shoutedBy).to.be.an('array').that.is.not.empty // eslint-disable-line
  expect(shoutedBy[0].slug).to.equal(slug)
})

Then('the post with id {string} has been disliked by {string}', async function (id, slug) {
  let shoutedBy = await getPostShoutedBy(id)

  expect(shoutedBy).to.be.an('array').that.is.empty // eslint-disable-line
})

async function getPostShoutedBy (id) {
  let result = await client.request(`
    query {
      Post(id: "${id}") {
        shoutedBy {
          slug
        }
      }
    }
  `)

  return result.Post[0].shoutedBy
}

function getPost (id) {
  return client.request(`
    query {
      Post(id: "${id}") {
        title
      }
    }
  `)
}
