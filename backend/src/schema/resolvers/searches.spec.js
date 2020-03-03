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
  await cleanDatabase()
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

describe('resolvers', () => {
  describe('searches', () => {
    beforeAll(async () => {
      const user = await Factory.build('user', {
        id: 'a-user',
        name: 'John Doe',
        slug: 'john-doe',
      })
      await Factory.build('post', {
        id: 'a-post',
        title: 'Beitrag',
        content: 'Ein erster Beitrag',
      })
      authenticatedUser = await user.toJson()
    })
    let variables

    describe('basic searches', () => {
      it('finds the post', async () => {
        variables = { query: 'Beitrag' }
        const res = await query({ query: searchQuery, variables })
        // console.log(res)
        expect(res.data.findResources).toHaveLength(1)
      })

      it('does not find the post', async () => {
        variables = { query: 'Unfug' }
        const res = await query({ query: searchQuery, variables })
        expect(res.data.findResources).toHaveLength(0)
      })

      it('finds the user', async () => {
        variables = { query: 'John' }
        const res = await query({ query: searchQuery, variables })
        // console.log(res)
        expect(res.data.findResources).toHaveLength(1)
      })

      it('does not find the user', async () => {
        variables = { query: 'Unfug' }
        const res = await query({ query: searchQuery, variables })
        expect(res.data.findResources).toHaveLength(0)
      })
    })

    describe('more data added', () => {
      beforeAll(async () => {
        await Promise.all([
          Factory.build('post', {
            id: 'b-post',
            title: 'Aufruf',
            content: 'Jeder sollte seinen Beitrag leisten.',
          }),
          Factory.build('post', {
            id: 'c-post',
            title: 'Die binomischen Formeln',
            content: `
1. binomische Formel: (a + b)² = a² + 2ab + b²
2. binomische Formel: (a - b)² = a² - 2ab + b²
3. binomische Formel: (a + b)(a - b) = a² - b²
`,
          }),
          Factory.build('post', {
            id: 'd-post',
            title: 'Der Panther',
            content: `
Sein Blick ist vom Vorübergehn der Stäbe
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
und hört im Herzen auf zu sein.
`,
          }),
          Factory.build('post', {
            id: 'e-post',
            title: 'Typographie',
            content: `
Gelegentlich können sowohl der angeführte Text als auch der Begleitsatz mit Frage- oder Ausrufezeichen enden (§ 91):
Gefällt dir der Roman „Quo vadis?“? Lass doch dieses ewige „Ich will nicht!“!
`,
          }),
          Factory.build('post', {
            id: 'f-post',
            title: 'Typographie II',
            content: `
Der Gedankenstrich kann als Auslassungszeichen (Auslassungsstrich) eine längere Pause oder eine Ellipse darstellen: „Du willst doch wohl nicht etwa –“, „Mein Gott, woher nehm ich bloß –?“
`,
          }),
          Factory.build('post', {
            id: 'g-post',
            title: 'AK-47',
            content: `
Vom AK-47 Typ I existiert eine Version mit unter die Waffe klappbarer Schulterstütze, das AKS-47 (russisch Автомат Калашникова складной образца 1947 года, transkr.: Avtomat Kalašnikova skladnoj obrazca 1947 goda, dt. Automat Kalaschnikow klappbar Modell 1947tes Jahr) genannt wird, seltener auch AK-47s. 
`,
          }),
          Factory.build('user', {
            id: 'b-user',
            name: 'Johnannes der Täufer',
            slug: 'johnannes-der-taufer',
          }),
          Factory.build('user', {
            id: 'c-user',
            name: 'Rainer Maria Rilke',
            slug: 'rainer-maria-rilke',
          }),
          Factory.build('user', {
            id: 'd-user',
            name: 'Erich Maria Remarque',
            slug: 'erich-maria-remarque',
          }),
          Factory.build('user', {
            id: 'e-user',
            name: 'Klaus Dieter',
            slug: 'kd',
          }),
          Factory.build('user', {
            id: 'f-user',
            name: 'Sluggy',
            slug: '_',
          }),
          Factory.build('user', {
            id: 'g-user',
            name: 'AKK',
            slug: 'akk',
          }),
        ])
      })

      it('finds the AK-47', async () => {
        variables = { query: 'AK-47' }
        const res = await query({ query: searchQuery, variables })
        expect(res.data.findResources).toHaveLength(1)
      })
    })
  })
})
