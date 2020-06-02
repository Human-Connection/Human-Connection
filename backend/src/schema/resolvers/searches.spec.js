import Factory, { cleanDatabase } from '../../db/factories'
import { gql } from '../../helpers/jest'
import { getNeode, getDriver } from '../../db/neo4j'
import createServer from '../../server'
import { createTestClient } from 'apollo-server-testing'

let query, authenticatedUser, user

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
    searchResults(query: $query, limit: 5) {
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
      ... on Tag {
        id
      }
    }
  }
`

const searchPostQuery = gql`
  query($query: String!, $firstPosts: Int, $postsOffset: Int) {
    searchPosts(query: $query, firstPosts: $firstPosts, postsOffset: $postsOffset) {
      postCount
      posts {
        __typename
        id
        title
        content
      }
    }
  }
`

describe('resolvers/searches', () => {
  let variables

  describe('given one user', () => {
    beforeAll(async () => {
      user = await Factory.build('user', {
        id: 'a-user',
        name: 'John Doe',
        slug: 'john-doe',
      })
      authenticatedUser = await user.toJson()
    })

    describe('query contains first name of user', () => {
      it('finds the user', async () => {
        variables = { query: 'John' }
        await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
          data: {
            searchResults: [
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
          { authorId: 'a-user' },
        )
      })

      describe('query contains title of post', () => {
        it('finds the post', async () => {
          variables = { query: 'beitrag' }
          await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
            data: {
              searchResults: [
                {
                  __typename: 'Post',
                  id: 'a-post',
                  title: 'Beitrag',
                  content: 'Ein erster Beitrag',
                },
              ],
            },
            errors: undefined,
          })
        })
      })

      describe('casing', () => {
        it('does not matter', async () => {
          variables = { query: 'BEITRAG' }
          await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
            data: {
              searchResults: [
                {
                  __typename: 'Post',
                  id: 'a-post',
                  title: 'Beitrag',
                  content: 'Ein erster Beitrag',
                },
              ],
            },
            errors: undefined,
          })
        })
      })

      describe('query consists of words not present in the corpus', () => {
        it('returns empty search results', async () => {
          await expect(
            query({ query: searchQuery, variables: { query: 'Unfug' } }),
          ).resolves.toMatchObject({ data: { searchResults: [] } })
        })
      })

      describe('testing different post content', () => {
        beforeAll(async () => {
          return Promise.all([
            Factory.build(
              'post',
              {
                id: 'b-post',
                title: 'Aufruf',
                content: 'Jeder sollte seinen Beitrag leisten.',
              },
              { authorId: 'a-user' },
            ),
            Factory.build(
              'post',
              {
                id: 'g-post',
                title: 'Zusammengesetzte Wörter',
                content: `Ein Bindestrich kann zwischen zwei Substantiven auch dann gesetzt werden, wenn drei gleichlautende Buchstaben aufeinandertreffen. Das ist etwa bei einem „Teeei“ der Fall, das so korrekt geschrieben ist. Möglich ist hier auch die Schreibweise mit Bindestrich: Tee-Ei.`,
              },
              { authorId: 'a-user' },
            ),
            Factory.build(
              'post',
              {
                id: 'c-post',
                title: 'Die binomischen Formeln',
                content: `1. binomische Formel: (a + b)² = a² + 2ab + b²
2. binomische Formel: (a - b)² = a² - 2ab + b²
3. binomische Formel: (a + b)(a - b) = a² - b²`,
              },
              { authorId: 'a-user' },
            ),
            Factory.build(
              'post',
              {
                id: 'd-post',
                title: 'Der Panther',
                content: `Sein Blick ist vom Vorübergehn der Stäbe
so müd geworden, daß er nichts mehr hält.
Ihm ist, als ob es tausend Stäbe gäbe
und hinter tausend Stäben keine Welt.`,
              },
              { authorId: 'a-user' },
            ),
          ])
        })

        describe('a post which content contains the title of the first post', () => {
          describe('query contains the title of the first post', () => {
            it('finds both posts', async () => {
              variables = { query: 'beitrag' }
              await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                data: {
                  searchResults: expect.arrayContaining([
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
                errors: undefined,
              })
            })
          })
        })

        describe('a post that contains a hyphen between two words and German quotation marks', () => {
          describe('hyphens in query', () => {
            it('will be treated as ordinary characters', async () => {
              variables = { query: 'tee-ei' }
              await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                data: {
                  searchResults: [
                    {
                      __typename: 'Post',
                      id: 'g-post',
                      title: 'Zusammengesetzte Wörter',
                      content: `Ein Bindestrich kann zwischen zwei Substantiven auch dann gesetzt werden, wenn drei gleichlautende Buchstaben aufeinandertreffen. Das ist etwa bei einem „Teeei“ der Fall, das so korrekt geschrieben ist. Möglich ist hier auch die Schreibweise mit Bindestrich: Tee-Ei.`,
                    },
                  ],
                },
                errors: undefined,
              })
            })
          })

          describe('German quotation marks in query to test unicode characters (\u201E ... \u201C)', () => {
            it('will be treated as ordinary characters', async () => {
              variables = { query: '„teeei“' }
              await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                data: {
                  searchResults: [
                    {
                      __typename: 'Post',
                      id: 'g-post',
                      title: 'Zusammengesetzte Wörter',
                      content: `Ein Bindestrich kann zwischen zwei Substantiven auch dann gesetzt werden, wenn drei gleichlautende Buchstaben aufeinandertreffen. Das ist etwa bei einem „Teeei“ der Fall, das so korrekt geschrieben ist. Möglich ist hier auch die Schreibweise mit Bindestrich: Tee-Ei.`,
                    },
                  ],
                },
                errors: undefined,
              })
            })
          })
        })

        describe('a post that contains a simple mathematical exprssion and line breaks', () => {
          describe('query a part of the mathematical expression', () => {
            it('finds that post', async () => {
              variables = { query: '(a - b)²' }
              await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                data: {
                  searchResults: [
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
                errors: undefined,
              })
            })
          })

          describe('query the same part of the mathematical expression without spaces', () => {
            it('finds that post', async () => {
              variables = { query: '(a-b)²' }
              await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                data: {
                  searchResults: [
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
                errors: undefined,
              })
            })
          })

          describe('query the mathematical expression over line break', () => {
            it('finds that post', async () => {
              variables = { query: '+ b² 2.' }
              await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                data: {
                  searchResults: [
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
                errors: undefined,
              })
            })
          })
        })

        describe('a post that contains a poem', () => {
          describe('query for more than one word, e.g. the title of the poem', () => {
            it('finds the poem and another post that contains only one word but with lower score', async () => {
              variables = { query: 'der panther' }
              await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                data: {
                  searchResults: [
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
                errors: undefined,
              })
            })
          })

          describe('query for the first four letters of two longer words', () => {
            it('finds the posts that contain words starting with these four letters', async () => {
              variables = { query: 'Vorü Subs' }
              await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
                data: {
                  searchResults: expect.arrayContaining([
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
                errors: undefined,
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
                searchResults: expect.arrayContaining([
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
              errors: undefined,
            })
          })
        })
      })

      describe('adding a user and a hashtag with a name that is content of a post', () => {
        beforeAll(async () => {
          await Promise.all([
            Factory.build('user', {
              id: 'f-user',
              name: 'Peter Panther',
              slug: 'peter-panther',
            }),
            await Factory.build('tag', { id: 'Panther' }),
          ])
        })

        describe('query the word that contains the post, the hashtag and the name of the user', () => {
          it('finds the user, the post and the hashtag', async () => {
            variables = { query: 'panther' }
            await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
              data: {
                searchResults: expect.arrayContaining([
                  {
                    __typename: 'User',
                    id: 'f-user',
                    name: 'Peter Panther',
                    slug: 'peter-panther',
                  },
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
                    __typename: 'Tag',
                    id: 'Panther',
                  },
                ]),
              },
              errors: undefined,
            })
          })
        })

        describe('@query the word that contains the post, the hashtag and the name of the user', () => {
          it('only finds the user', async () => {
            variables = { query: '@panther' }
            await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
              data: {
                searchResults: expect.not.arrayContaining([
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
                    __typename: 'Tag',
                    id: 'Panther',
                  },
                ]),
              },
              errors: undefined,
            })
          })
        })

        describe('!query the word that contains the post, the hashtag and the name of the user', () => {
          it('only finds the post', async () => {
            variables = { query: '!panther' }
            await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
              data: {
                searchResults: expect.not.arrayContaining([
                  {
                    __typename: 'User',
                    id: 'f-user',
                    name: 'Peter Panther',
                    slug: 'peter-panther',
                  },
                  {
                    __typename: 'Tag',
                    id: 'Panther',
                  },
                ]),
              },
              errors: undefined,
            })
          })
        })

        describe('#query the word that contains the post, the hashtag and the name of the user', () => {
          it('only finds the hashtag', async () => {
            variables = { query: '#panther' }
            await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
              data: {
                searchResults: expect.not.arrayContaining([
                  {
                    __typename: 'User',
                    id: 'f-user',
                    name: 'Peter Panther',
                    slug: 'peter-panther',
                  },
                  {
                    __typename: 'Post',
                    id: 'd-post',
                    title: 'Der Panther',
                    content: `Sein Blick ist vom Vorübergehn der Stäbe<br>
so müd geworden, daß er nichts mehr hält.<br>
Ihm ist, als ob es tausend Stäbe gäbe<br>
und hinter tausend Stäben keine Welt.`,
                  },
                ]),
              },
              errors: undefined,
            })
          })
        })
      })

      describe('adding a post, written by a user who is muted by the authenticated user', () => {
        beforeAll(async () => {
          const mutedUser = await Factory.build('user', {
            id: 'muted-user',
            name: 'Muted',
            slug: 'muted',
          })
          await user.relateTo(mutedUser, 'muted')
          await Factory.build(
            'post',
            {
              id: 'muted-post',
              title: 'Beleidigender Beitrag',
              content: 'Dieser Beitrag stammt von einem bleidigendem Nutzer.',
            },
            { authorId: 'muted-user' },
          )
        })

        describe('query for text in a post written by a muted user', () => {
          it('does not include the post of the muted user in the results', async () => {
            variables = { query: 'beitrag' }
            await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
              data: {
                searchResults: expect.not.arrayContaining([
                  {
                    __typename: 'Post',
                    id: 'muted-post',
                    title: 'Beleidigender Beitrag',
                    content: 'Dieser Beitrag stammt von einem bleidigendem Nutzer.',
                  },
                ]),
              },
              errors: undefined,
            })
          })
        })
      })

      describe('adding a tag', () => {
        beforeAll(async () => {
          await Factory.build('tag', { id: 'myHashtag' })
        })

        describe('query the first four characters of the tag', () => {
          it('finds the tag', async () => {
            variables = { query: 'myha' }
            await expect(query({ query: searchQuery, variables })).resolves.toMatchObject({
              data: {
                searchResults: [
                  {
                    __typename: 'Tag',
                    id: 'myHashtag',
                  },
                ],
              },
              errors: undefined,
            })
          })
        })
      })

      describe('searchPostQuery', () => {
        describe('query with limit 1', () => {
          it('has a count greater than 1', async () => {
            variables = { query: 'beitrag', firstPosts: 1, postsOffset: 0 }
            await expect(query({ query: searchPostQuery, variables })).resolves.toMatchObject({
              data: {
                searchPosts: {
                  postCount: 2,
                  posts: [
                    {
                      __typename: 'Post',
                      id: 'a-post',
                      title: 'Beitrag',
                      content: 'Ein erster Beitrag',
                    },
                  ],
                },
              },
              errors: undefined,
            })
          })
        })
      })
    })
  })
})
