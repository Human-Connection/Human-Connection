// features/support/assertions.js
import { Given, BeforeAll, setWorldConstructor } from 'cucumber'
import { GraphQLClient } from 'graphql-request'
import Factory from '../../../src/seed/factories'

const factory = Factory()
const client = new GraphQLClient('http://127.0.0.1:4123')
// setDefaultTimeout(60 * 1000)

setWorldConstructor()

async function createUser(slug) {
  const result = await client.request(`
    query {
      User(slug: "${slug}") {
        slug
        id
      }
    }
  `)

  if (result.User.length === 0) {
    return factory.create('User', {
      name: slug,
      slug: slug,
      email: 'example@test.org',
      password: '1234',
      actorId: `http://localhost:4123/api/users/${slug}`,
    })
  }
  // await login({ email: 'example@test.org', password: '1234' })
}

BeforeAll('Clean Database for fresh test setup', async function() {
  // await factory.cleanDatabase()
})

Given('our own server runs at {string}', function(string) {
  // just documenation
})

Given('we have the following post in our database:', function(activity) {
  return this.post('/api/inbox', activity)
})

Given('we have the following users in our database:', function(dataTable) {
  return Promise.all(
    dataTable.hashes().map(user => {
      return createUser(user.Slug)
    }),
  )
})
