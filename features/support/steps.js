// features/support/steps.js
import { Given, When, Then, After, AfterAll } from 'cucumber'
import Factory, { cleanDatabase } from '../../backend/src/db/factories'
import { getNeode } from '../../backend/src/db/neo4j'
import expect from 'expect'

const debug = require('debug')('ea:test:steps')
const neode = getNeode()

After(async () => {
  await cleanDatabase()
})

Given('our CLIENT_URI is {string}', function (string) {
  expect(string).toEqual('http://localhost:3000')
  // This is just for documentation. When you see URLs in the response of
  // scenarios you, should be able to tell that it's coming from this
  // environment variable.
});

Given('we have the following users in our database:', function (dataTable) {
  return Promise.all(dataTable.hashes().map(({ slug, name }) => {
    return Factory.build('user', {
      name,
      slug,
    })
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
  // let result
  // do {
  //   result = await neode.cypher('MATCH (user:User {slug: $slug}) RETURN user;', { slug })
  //   result = result.records.map(record => record.get('user'))
  //   console.log('result', result)
  // } while (result.length === 0)
  this.lastInboxUrl = inboxUrl
  this.lastActivity = activity
  const response = await this.post(inboxUrl, activity)
  console.log('response', response)
  this.lastResponses.push(response.lastResponse)
  this.lastResponse = response.lastResponse
  this.statusCode = response.statusCode
})

Then('the server responds with a HTTP Status {int} and the following json:', function (statusCode, docString) {
  expect(this.statusCode).toEqual(statusCode)
  const [ lastResponse ] = this.lastResponses
  expect(JSON.parse(lastResponse)).toMatchObject(JSON.parse(docString))
})

Then('the Content-Type is {string}', function (contentType) {
  expect(this.lastContentType).toEqual(contentType)
})

Then('I expect the status code to be {int}', function (statusCode) {
  expect(this.statusCode).toEqual(statusCode)
})

Then('the post with id {string} to be created', async function (id) {
  let newlyCreatedPost = neode.cypher('MATCH (post:Post {id: $id) RETURN post {.*}', { id })
  newlyCreatedPost.records.map(record => record.get('post'))
  expect(newlyCreatedPost).toHaveLength(1) 
})