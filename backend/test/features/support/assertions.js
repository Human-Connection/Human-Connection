// features/support/assertions.js
import { Given, Then } from 'cucumber'
import { expect } from 'chai'
import { GraphQLClient } from 'graphql-request'
import { host } from '../../../src/jest/helpers'

const client = new GraphQLClient(host)
// setDefaultTimeout(60 * 1000)

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

Given('the activity {string} has been liked by {string}', (activityId, name) => {

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
