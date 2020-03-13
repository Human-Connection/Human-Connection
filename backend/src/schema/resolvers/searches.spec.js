import Factory, { cleanDatabase } from '../../db/factories'
import { gql } from '../../helpers/jest'
import { getNeode, getDriver } from '../../db/neo4j'
import createServer from '../../server'
import { createTestClient } from 'apollo-server-testing'

let query, authenticatedUser

const driver = getDriver()
const neode = getNeode()

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
    let variables

    describe('given one user', () => {
      beforeAll(async () => {
        const user = await Factory.build('user', {
          id: 'a-user',
          name: 'John Doe',
          slug: 'john-doe',
        })
        authenticatedUser = await user.toJson()
      })

      const factoryOptions = {
        authorId: 'a-user',
      }

      describe('query contains first name of user', () => {
        it('finds the user', async () => {
          variables = { query: 'John' }
          await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
            data: {
              findResources: [
                {
                  id: 'a-user',
                  name: 'John Doe',
                  slug: 'john-doe',
                },
              ],
            },
          })
        })
      })

      describe('adding one post', () => {
        beforeAll(async () => {
          await Factory.build(
            'post',
            {
              id: 'a-post',
              title: 'Beitrag',
              content: 'Ein erster Beitrag',
            },
            factoryOptions,
          )
        })

        describe('query contains title of post', () => {
          it('finds the post', async () => {
            variables = { query: 'beitrag' }
            await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
              data: {
                findResources: [
                  {
                    __typename: 'Post',
                    id: 'a-post',
                    title: 'Beitrag',
                    content: 'Ein erster Beitrag',
                  },
                ],
              },
            })
          })
        })

        describe('casing', () => {
          it('does not matter', async () => {
            variables = { query: 'BEITRAG' }
            await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
              data: {
                findResources: [
                  {
                    __typename: 'Post',
                    id: 'a-post',
                    title: 'Beitrag',
                    content: 'Ein erster Beitrag',
                  },
                ],
              },
            })
          })
        })

        describe('query consists of words not present in the corpus', () => {
          it('returns empty search results', async () => {
            await expect(
              query({ query: searchQuery, variables: { query: 'Unfug' } }),
            ).resolves.toMatchObject({ data: { findResources: [] } })
          })
        })

        describe('testing different post content', () => {
          const addPost = post => {
            return Factory.build(
              'post',
              {
                id: post.id,
                title: post.title,
                content: post.content,
              },
              factoryOptions,
            )
          }

          describe('adding a post which content contains the title of the first post', () => {
            describe('query contains the title of the first post', () => {
              it('finds both posts', async () => {
                await addPost({
                  __typename: 'Post',
                  id: 'b-post',
                  title: 'Aufruf',
                  content: 'Jeder sollte seinen Beitrag leisten.',
                })
                variables = { query: 'beitrag' }
                await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                  data: {
                    findResources: expect.arrayContaining([
                      {
                        __typename: 'Post',
                        id: 'a-post',
                        title: 'Beitrag',
                        content: 'Ein erster Beitrag',
                      },
                      {
                        __typename: 'Post',
                        id: 'b-post',
                        title: 'Aufruf',
                        content: 'Jeder sollte seinen Beitrag leisten.',
                      },
                    ]),
                  },
                })
              })
            })
          })

          describe('adding a post that contains a hyphen between two words and German quotation marks', () => {
            describe('hyphens in query', () => {
              it('will be treated as ordinary characters', async () => {
                await addPost({
                  id: 'g-post',
                  title: 'Zusammengesetzte Wörter',
                  content: `Ein Bindestrich kann zwischen zwei Substantiven auch dann gesetzt werden, wenn drei gleichlautende Buchstaben aufeinandertreffen. Das ist etwa bei einem „Teeei“ der Fall, das so korrekt geschrieben ist. Möglich ist hier auch die Schreibweise mit Bindestrich: Tee-Ei.`,
                })
                variables = { query: 'tee-ei' }
                await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                  data: {
                    findResources: [
                      {
                        __typename: 'Post',
                        id: 'g-post',
                        title: 'Zusammengesetzte Wörter',
                        content: `Ein Bindestrich kann zwischen zwei Substantiven auch dann gesetzt werden, wenn drei gleichlautende Buchstaben aufeinandertreffen. Das ist etwa bei einem „Teeei“ der Fall, das so korrekt geschrieben ist. Möglich ist hier auch die Schreibweise mit Bindestrich: Tee-Ei.`,
                      },
                    ],
                  },
                })
              })
            })

            describe('German quotation marks in query', () => {
              it('will be treated as ordinary characters', async () => {
                variables = { query: '„teeei“' }
                await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                  data: {
                    findResources: [
                      {
                        __typename: 'Post',
                        id: 'g-post',
                        title: 'Zusammengesetzte Wörter',
                        content: `Ein Bindestrich kann zwischen zwei Substantiven auch dann gesetzt werden, wenn drei gleichlautende Buchstaben aufeinandertreffen. Das ist etwa bei einem „Teeei“ der Fall, das so korrekt geschrieben ist. Möglich ist hier auch die Schreibweise mit Bindestrich: Tee-Ei.`,
                      },
                    ],
                  },
                })
              })
            })
          })

          describe('adding a post that contains a simple mathematical exprssion and linebreaks', () => {
            describe('query a part of the mathematical expression', () => {
              it('finds that post', async () => {
                await addPost({
                  id: 'c-post',
                  title: 'Die binomischen Formeln',
                  content: `1. binomische Formel: (a + b)² = a² + 2ab + b²
2. binomische Formel: (a - b)² = a² - 2ab + b²
3. binomische Formel: (a + b)(a - b) = a² - b²`,
                })
                variables = { query: '(a - b)²' }
                await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                  data: {
                    findResources: [
                      {
                        __typename: 'Post',
                        id: 'c-post',
                        title: 'Die binomischen Formeln',
                        content: `1. binomische Formel: (a + b)² = a² + 2ab + b²<br>
2. binomische Formel: (a - b)² = a² - 2ab + b²<br>
3. binomische Formel: (a + b)(a - b) = a² - b²`,
                      },
                    ],
                  },
                })
              })
            })

            describe('query the same part of the mathematical expression without spaces', () => {
              it('finds that post', async () => {
                variables = { query: '(a-b)²' }
                await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                  data: {
                    findResources: [
                      {
                        __typename: 'Post',
                        id: 'c-post',
                        title: 'Die binomischen Formeln',
                        content: `1. binomische Formel: (a + b)² = a² + 2ab + b²<br>
2. binomische Formel: (a - b)² = a² - 2ab + b²<br>
3. binomische Formel: (a + b)(a - b) = a² - b²`,
                      },
                    ],
                  },
                })
              })
            })

            describe('query the mathematical expression over linebreak', () => {
              it('finds that post', async () => {
                variables = { query: '+ b² 2.' }
                await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                  data: {
                    findResources: [
                      {
                        __typename: 'Post',
                        id: 'c-post',
                        title: 'Die binomischen Formeln',
                        content: `1. binomische Formel: (a + b)² = a² + 2ab + b²<br>
2. binomische Formel: (a - b)² = a² - 2ab + b²<br>
3. binomische Formel: (a + b)(a - b) = a² - b²`,
                      },
                    ],
                  },
                })
              })
            })
          })

          describe('adding a post that contains a poem', () => {
            describe('query for more than one word, e.g. the title of the poem', () => {
              it('finds the poem and another post that contains only one word but with lower score', async () => {
                await addPost({
                  id: 'd-post',
                  title: 'Der Panther',
                  content: `Sein Blick ist vom Vorübergehn der Stäbe
so müd geworden, daß er nichts mehr hält.
Ihm ist, als ob es tausend Stäbe gäbe
und hinter tausend Stäben keine Welt.`,
                })
                variables = { query: 'der panther' }
                await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                  data: {
                    findResources: [
                      {
                        __typename: 'Post',
                        id: 'd-post',
                        title: 'Der Panther',
                        content: `Sein Blick ist vom Vorübergehn der Stäbe<br>
so müd geworden, daß er nichts mehr hält.<br>
Ihm ist, als ob es tausend Stäbe gäbe<br>
und hinter tausend Stäben keine Welt.`,
                      },
                      {
                        __typename: 'Post',
                        id: 'g-post',
                        title: 'Zusammengesetzte Wörter',
                        content: `Ein Bindestrich kann zwischen zwei Substantiven auch dann gesetzt werden, wenn drei gleichlautende Buchstaben aufeinandertreffen. Das ist etwa bei einem „Teeei“ der Fall, das so korrekt geschrieben ist. Möglich ist hier auch die Schreibweise mit Bindestrich: Tee-Ei.`,
                      },
                    ],
                  },
                })
              })
            })

            describe('query for the first four letters of two longer words', () => {
              it('finds the posts that contain words starting with these four letters', async () => {
                variables = { query: 'Vorü Subs' }
                await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                  data: {
                    findResources: expect.arrayContaining([
                      {
                        __typename: 'Post',
                        id: 'd-post',
                        title: 'Der Panther',
                        content: `Sein Blick ist vom Vorübergehn der Stäbe<br>
so müd geworden, daß er nichts mehr hält.<br>
Ihm ist, als ob es tausend Stäbe gäbe<br>
und hinter tausend Stäben keine Welt.`,
                      },
                      {
                        __typename: 'Post',
                        id: 'g-post',
                        title: 'Zusammengesetzte Wörter',
                        content: `Ein Bindestrich kann zwischen zwei Substantiven auch dann gesetzt werden, wenn drei gleichlautende Buchstaben aufeinandertreffen. Das ist etwa bei einem „Teeei“ der Fall, das so korrekt geschrieben ist. Möglich ist hier auch die Schreibweise mit Bindestrich: Tee-Ei.`,
                      },
                    ]),
                  },
                })
              })
            })
          })
        })

        describe('adding two users that have the same word in their slugs', () => {
          beforeAll(async () => {
            await Promise.all([
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
            ])
          })

          describe('query the word that both slugs contain', () => {
            it('finds both users', async () => {
              variables = { query: '-maria-' }
              await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                data: {
                  findResources: expect.arrayContaining([
                    {
                      __typename: 'User',
                      id: 'c-user',
                      name: 'Rainer Maria Rilke',
                      slug: 'rainer-maria-rilke',
                    },
                    {
                      __typename: 'User',
                      id: 'd-user',
                      name: 'Erich Maria Remarque',
                      slug: 'erich-maria-remarque',
                    },
                  ]),
                },
              })
            })
          })
        })
      })

      /*
      it('finds Russian text', async () => {
        variables = { query: 'Калашникова' }
        const expected = createExpectedObject([gPost])
        await expect(query({ query: searchQuery, variables })).resolves.toMatchObject(expected)
	}) */
    })
  })
})
