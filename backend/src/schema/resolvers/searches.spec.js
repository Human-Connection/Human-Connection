import Factory, { cleanDatabase } from '../../db/factories'
import { gql } from '../../helpers/jest'
import { getNeode, getDriver } from '../../db/neo4j'
import createServer from '../../server'
import { createTestClient } from 'apollo-server-testing'

let query, authenticatedUser

const driver = getDriver()
const neode = getNeode()

jest.setTimeout(30000)

beforeAll(async () => {
  await cleanDatabase()
  const { server } = createServer({
    context: () => {
      return {
        driver,
        neode,
        user: authenticatedUser,
      }
    },
  })
  query = createTestClient(server).query
})

afterAll(async () => {
  // await cleanDatabase()
})

const searchQuery = gql`
  query($query: String!) {
    findResources(query: $query, limit: 5) {
      __typename
      ... on Post {
        id
        title
        content
      }
      ... on User {
        id
        slug
        name
      }
    }
  }
`

const nothingFound = { data: { findResources: [] } }

const createExpectedObject = array => {
  return { data: { findResources: array } }
}

const addPostToDB = post => {
  return Factory.build('post', {
    id: post.id,
    title: post.title,
    content: post.content,
  })
}

const addUserToDB = user => {
  return Factory.build('user', {
    id: user.id,
    name: user.name,
    slug: user.slug,
  })
}

const createDataObject = (obj, type) => {
  return { __typename: type, ...obj }
}

const createPostObject = post => {
  return createDataObject(post, 'Post')
}

const createUserObject = user => {
  return createDataObject(user, 'User')
}

// see data at the end of the file

let user

describe('resolvers', () => {
  describe('searches', () => {
    beforeAll(async () => {
      user = await addUserToDB(aUser)
      await addPostToDB(aPost)
      authenticatedUser = await user.toJson()
    })

    let variables

    describe('basic searches', () => {
      it('finds the post', async () => {
        variables = { query: 'Beitrag' }
        const expected = createExpectedObject([aPost])
        await expect(query({ query: searchQuery, variables })).resolves.toMatchObject(expected)
      })

      it('does not find the post', async () => {
        variables = { query: 'Unfug' }
        await expect(query({ query: searchQuery, variables })).resolves.toMatchObject(nothingFound)
      })

      it('finds the user', async () => {
        variables = { query: 'John' }
        const expected = createExpectedObject([aUser])
        await expect(query({ query: searchQuery, variables })).resolves.toMatchObject(expected)
      })

      it('does not find the user', async () => {
        variables = { query: 'Unfug' }
        await expect(query({ query: searchQuery, variables })).resolves.toMatchObject(nothingFound)
      })
    })

    describe('more data added', () => {
      beforeAll(async () => {
        await Promise.all([
          addPostToDB(bPost),
          addPostToDB(cPost),
          addPostToDB(dPost),
          addPostToDB(ePost),
          addPostToDB(fPost),
          addPostToDB(gPost),
          addUserToDB(bUser),
          addUserToDB(cUser),
          addUserToDB(dUser),
          addUserToDB(eUser),
          addUserToDB(fUser),
          addUserToDB(gUser),
        ])
      })

      it('finds the AK-47', async () => {
        variables = { query: 'AK-47' }
        const expected = createExpectedObject([gPost])
        await expect(query({ query: searchQuery, variables })).resolves.toMatchObject(expected)
      })

      it('finds more than one post', async () => {
        variables = { query: 'Beitrag' }
        const expected = createExpectedObject([aPost, bPost])
        await expect(query({ query: searchQuery, variables })).resolves.toMatchObject(expected)
      })

      it('finds more than one user by slug', async () => {
        variables = { query: '-maria-' }
        const expected = createExpectedObject([dUser, cUser])
        await expect(query({ query: searchQuery, variables })).resolves.toMatchObject(expected)
      })

      it('finds Russian text', async () => {
        variables = { query: 'Калашникова' }
        const expected = createExpectedObject([gPost])
        await expect(query({ query: searchQuery, variables })).resolves.toMatchObject(expected)
      })
    })
  })
})

// data section

const aPost = createPostObject({
  id: 'a-post',
  title: 'Beitrag',
  content: 'Ein erster Beitrag',
})

const bPost = createPostObject({
  id: 'b-post',
  title: 'Aufruf',
  content: 'Jeder sollte seinen Beitrag leisten.',
})

const cPost = createPostObject({
  id: 'c-post',
  title: 'Die binomischen Formeln',
  content: `1. binomische Formel: (a + b)² = a² + 2ab + b²
2. binomische Formel: (a - b)² = a² - 2ab + b²
3. binomische Formel: (a + b)(a - b) = a² - b²`,
})

const dPost = createPostObject({
  id: 'd-post',
  title: 'Der Panther',
  content: `Sein Blick ist vom Vorübergehn der Stäbe
so müd geworden, daß er nichts mehr hält.
Ihm ist, als ob es tausend Stäbe gäbe
und hinter tausend Stäben keine Welt.

Der weiche Gang geschmeidig starker Schritte,
der sich im allerkleinsten Kreise dreht,
ist wie ein Tanz von Kraft um eine Mitte,
in der betäubt ein großer Wille steht.

Nur manchmal schiebt der Vorhang der Pupille
sich lautlos auf –. Dann geht ein Bild hinein,
geht durch der Glieder angespannte Stille –
und hört im Herzen auf zu sein.`,
})

const ePost = createPostObject({
  id: 'e-post',
  title: 'Typographie',
  content: `Gelegentlich können sowohl der angeführte Text als auch der Begleitsatz mit Frage- oder Ausrufezeichen enden (§ 91):
Gefällt dir der Roman „Quo vadis?“? Lass doch dieses ewige „Ich will nicht!“!`,
})

const fPost = createPostObject({
  id: 'f-post',
  title: 'Typographie II',
  content: `Der Gedankenstrich kann als Auslassungszeichen (Auslassungsstrich) eine längere Pause oder eine Ellipse darstellen: „Du willst doch wohl nicht etwa –“, „Mein Gott, woher nehm ich bloß –?“`,
})

const gPost = createPostObject({
  id: 'g-post',
  title: 'AK-47',
  content: `Vom AK-47 Typ I existiert eine Version mit unter die Waffe klappbarer Schulterstütze, das AKS-47 (russisch Автомат Калашникова складной образца 1947 года, transkr.: Avtomat Kalašnikova skladnoj obrazca 1947 goda, dt. Automat Kalaschnikow klappbar Modell 1947tes Jahr) genannt wird, seltener auch AK-47s.`,
})

const aUser = createUserObject({
  id: 'a-user',
  name: 'John Doe',
  slug: 'john-doe',
})

const bUser = createUserObject({
  id: 'b-user',
  name: 'Johnannes der Täufer',
  slug: 'johnannes-der-taufer',
})

const cUser = createUserObject({
  id: 'c-user',
  name: 'Rainer Maria Rilke',
  slug: 'rainer-maria-rilke',
})

const dUser = createUserObject({
  id: 'd-user',
  name: 'Erich Maria Remarque',
  slug: 'erich-maria-remarque',
})

const eUser = createUserObject({
  id: 'e-user',
  name: 'Klaus Dieter',
  slug: 'kd',
})

const fUser = createUserObject({
  id: 'f-user',
  name: 'Sluggy',
  slug: '_',
})

const gUser = createUserObject({
  id: 'g-user',
  name: 'AKK',
  slug: 'akk',
})
