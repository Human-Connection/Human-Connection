import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login } from '../../jest/helpers'

const factory = Factory()
let client
let userParams
let authorParams

const postTitle = 'I am a title'
const postContent = 'Some content'
const oldTitle = 'Old title'
const oldContent = 'Old content'
const newTitle = 'New title'
const newContent = 'New content'
const createPostVariables = { title: postTitle, content: postContent }
const createPostWithCategoriesMutation = `
  mutation($title: String!, $content: String!, $categoryIds: [ID]) {
    CreatePost(title: $title, content: $content, categoryIds: $categoryIds) {
      id
      title
    }
  }
`
const createPostWithCategoriesVariables = {
  title: postTitle,
  content: postContent,
  categoryIds: ['cat9', 'cat4', 'cat15'],
}
const postQueryWithCategories = `
  query($id: ID) {
    Post(id: $id) {
      categories {
        id
      }
    }
  }
`
const createPostWithoutCategoriesVariables = {
  title: 'This is a post without categories',
  content: 'I should be able to filter it out',
  categoryIds: null,
}
const postQueryFilteredByCategory = `
query Post($filter: _PostFilter) {
  Post(filter: $filter) {
      title
      id
      categories {
        id
      }
    }
  }
`
const postCategoriesFilterParam = { categories_some: { id_in: ['cat4'] } }
const postQueryFilteredByCategoryVariables = {
  filter: postCategoriesFilterParam,
}
beforeEach(async () => {
  userParams = {
    id: 'u198',
    name: 'TestUser',
    email: 'test@example.org',
    password: '1234',
  }
  authorParams = {
    id: 'u25',
    email: 'author@example.org',
    password: '1234',
  }
  await factory.create('User', userParams)
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('CreatePost', () => {
  const mutation = `
    mutation($title: String!, $content: String!) {
      CreatePost(title: $title, content: $content) {
        title
        content
        slug
        disabled
        deleted
      }
    }
  `

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      await expect(client.request(mutation, createPostVariables)).rejects.toThrow('Not Authorised')
    })
  })

  describe('authenticated', () => {
    let headers
    beforeEach(async () => {
      headers = await login(userParams)
      client = new GraphQLClient(host, { headers })
    })

    it('creates a post', async () => {
      const expected = {
        CreatePost: {
          title: postTitle,
          content: postContent,
        },
      }
      await expect(client.request(mutation, createPostVariables)).resolves.toMatchObject(expected)
    })

    it('assigns the authenticated user as author', async () => {
      await client.request(mutation, createPostVariables)
      const { User } = await client.request(
        `{
          User(name: "TestUser") {
            contributions {
              title
            }
          }
        }`,
        { headers },
      )
      expect(User).toEqual([{ contributions: [{ title: postTitle }] }])
    })

    describe('disabled and deleted', () => {
      it('initially false', async () => {
        const expected = { CreatePost: { disabled: false, deleted: false } }
        await expect(client.request(mutation, createPostVariables)).resolves.toMatchObject(expected)
      })
    })

    describe('language', () => {
      it('allows a user to set the language of the post', async () => {
        const createPostWithLanguageMutation = `
          mutation($title: String!, $content: String!, $language: String) {
            CreatePost(title: $title, content: $content, language: $language) {
              language
            }
          }
        `
        const createPostWithLanguageVariables = {
          title: postTitle,
          content: postContent,
          language: 'en',
        }
        const expected = { CreatePost: { language: 'en' } }
        await expect(
          client.request(createPostWithLanguageMutation, createPostWithLanguageVariables),
        ).resolves.toEqual(expect.objectContaining(expected))
      })
    })

    describe('categories', () => {
      let postWithCategories
      beforeEach(async () => {
        await Promise.all([
          factory.create('Category', {
            id: 'cat9',
            name: 'Democracy & Politics',
            icon: 'university',
          }),
          factory.create('Category', {
            id: 'cat4',
            name: 'Environment & Nature',
            icon: 'tree',
          }),
          factory.create('Category', {
            id: 'cat15',
            name: 'Consumption & Sustainability',
            icon: 'shopping-cart',
          }),
        ])
        postWithCategories = await client.request(
          createPostWithCategoriesMutation,
          createPostWithCategoriesVariables,
        )
      })

      it('allows a user to set the categories of the post', async () => {
        const expected = [{ id: 'cat9' }, { id: 'cat4' }, { id: 'cat15' }]
        const postQueryWithCategoriesVariables = {
          id: postWithCategories.CreatePost.id,
        }

        await expect(
          client.request(postQueryWithCategories, postQueryWithCategoriesVariables),
        ).resolves.toEqual({ Post: [{ categories: expect.arrayContaining(expected) }] })
      })

      it('allows a user to filter for posts by category', async () => {
        await client.request(createPostWithCategoriesMutation, createPostWithoutCategoriesVariables)
        const categoryIds = [{ id: 'cat4' }, { id: 'cat15' }, { id: 'cat9' }]
        const expected = {
          Post: [
            {
              title: postTitle,
              id: postWithCategories.CreatePost.id,
              categories: expect.arrayContaining(categoryIds),
            },
          ],
        }
        await expect(
          client.request(postQueryFilteredByCategory, postQueryFilteredByCategoryVariables),
        ).resolves.toEqual(expected)
      })
    })
  })
})

describe('UpdatePost', () => {
  let updatePostMutation
  let updatePostVariables
  beforeEach(async () => {
    const asAuthor = Factory()
    await asAuthor.create('User', authorParams)
    await asAuthor.authenticateAs(authorParams)
    await asAuthor.create('Post', {
      id: 'p1',
      title: oldTitle,
      content: oldContent,
    })
    updatePostMutation = `
      mutation($id: ID!, $title: String!, $content: String!, $categoryIds: [ID]) {
        UpdatePost(id: $id, title: $title, content: $content, categoryIds: $categoryIds) {
          id
          content
        }
      }
    `

    updatePostVariables = {
      id: 'p1',
      title: newTitle,
      content: newContent,
      categoryIds: null,
    }
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      await expect(client.request(updatePostMutation, updatePostVariables)).rejects.toThrow(
        'Not Authorised',
      )
    })
  })

  describe('authenticated but not the author', () => {
    let headers
    beforeEach(async () => {
      headers = await login(userParams)
      client = new GraphQLClient(host, { headers })
    })

    it('throws authorization error', async () => {
      await expect(client.request(updatePostMutation, updatePostVariables)).rejects.toThrow(
        'Not Authorised',
      )
    })
  })

  describe('authenticated as author', () => {
    let headers
    beforeEach(async () => {
      headers = await login(authorParams)
      client = new GraphQLClient(host, { headers })
    })

    it('updates a post', async () => {
      const expected = { UpdatePost: { id: 'p1', content: newContent } }
      await expect(client.request(updatePostMutation, updatePostVariables)).resolves.toEqual(
        expected,
      )
    })

    describe('categories', () => {
      let postWithCategories
      beforeEach(async () => {
        await Promise.all([
          factory.create('Category', {
            id: 'cat9',
            name: 'Democracy & Politics',
            icon: 'university',
          }),
          factory.create('Category', {
            id: 'cat4',
            name: 'Environment & Nature',
            icon: 'tree',
          }),
          factory.create('Category', {
            id: 'cat15',
            name: 'Consumption & Sustainability',
            icon: 'shopping-cart',
          }),
          factory.create('Category', {
            id: 'cat27',
            name: 'Animal Protection',
            icon: 'paw',
          }),
        ])
        postWithCategories = await client.request(
          createPostWithCategoriesMutation,
          createPostWithCategoriesVariables,
        )
        updatePostVariables = {
          id: postWithCategories.CreatePost.id,
          title: newTitle,
          content: newContent,
          categoryIds: ['cat27'],
        }
      })

      it('allows a user to update the categories of a post', async () => {
        await client.request(updatePostMutation, updatePostVariables)
        const expected = [{ id: 'cat27' }]
        const postQueryWithCategoriesVariables = {
          id: postWithCategories.CreatePost.id,
        }
        await expect(
          client.request(postQueryWithCategories, postQueryWithCategoriesVariables),
        ).resolves.toEqual({ Post: [{ categories: expect.arrayContaining(expected) }] })
      })
    })
  })
})

describe('DeletePost', () => {
  const mutation = `
    mutation($id: ID!) {
      DeletePost(id: $id) {
        id
        content
      }
    }
  `

  let variables = {
    id: 'p1',
  }

  beforeEach(async () => {
    const asAuthor = Factory()
    await asAuthor.create('User', authorParams)
    await asAuthor.authenticateAs(authorParams)
    await asAuthor.create('Post', {
      id: 'p1',
      content: 'To be deleted',
    })
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
    })
  })

  describe('authenticated but not the author', () => {
    let headers
    beforeEach(async () => {
      headers = await login(userParams)
      client = new GraphQLClient(host, { headers })
    })

    it('throws authorization error', async () => {
      await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
    })
  })

  describe('authenticated as author', () => {
    let headers
    beforeEach(async () => {
      headers = await login(authorParams)
      client = new GraphQLClient(host, { headers })
    })

    it('deletes a post', async () => {
      const expected = { DeletePost: { id: 'p1', content: 'To be deleted' } }
      await expect(client.request(mutation, variables)).resolves.toEqual(expected)
    })
  })
})

describe('emotions', () => {
  let addPostEmotionsVariables
  let postEmotionsQueryVariables
  const postEmotionsQuery = `
    query($id: ID!) {
      Post(id: $id) {
        emotions {
          emotion
          User {
            id
          }
        }
      }
    }
  `
  beforeEach(async () => {
    const asAuthor = Factory()
    authorParams = {
      id: authorParams.id,
      email: 'wanna-add-emotions@example.org',
      password: '1234',
    }
    await asAuthor.create('User', authorParams)
    await asAuthor.authenticateAs(authorParams)
    await asAuthor.create('Post', {
      id: 'p1376',
      title: postTitle,
      content: postContent,
    })
    postEmotionsQueryVariables = { id: 'p1376' }
  })

  describe('AddPostEmotions', () => {
    beforeEach(() => {
      addPostEmotionsVariables = {
        from: { id: authorParams.id },
        to: { id: 'p1376' },
        data: { emotion: 'happy' },
      }
    })

    const addPostEmotionsMutation = `
      mutation($from: _UserInput!, $to: _PostInput!, $data: _EMOTEDInput!) {
        AddPostEmotions(from: $from, to: $to, data: $data) {
          from { id }
          to { id }
          emotion
        }
      }
    `
    const postEmotionsCountQuery = `
      query($id: ID!) {
        Post(id: $id) {
          emotionsCount
        }
      }
    `

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(
          client.request(addPostEmotionsMutation, {
            from: { id: authorParams.id },
            to: { id: 'p1376' },
            data: { emotion: 'happy' },
          }),
        ).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated and not the author', () => {
      let headers
      beforeEach(async () => {
        headers = await login(userParams)
        client = new GraphQLClient(host, { headers })
      })

      it('adds an emotion to the post', async () => {
        addPostEmotionsVariables.from.id = userParams.id
        const expected = {
          AddPostEmotions: {
            from: addPostEmotionsVariables.from,
            to: addPostEmotionsVariables.to,
            emotion: 'happy',
          },
        }
        await expect(
          client.request(addPostEmotionsMutation, addPostEmotionsVariables),
        ).resolves.toEqual(expected)
      })

      it('limits the addition of the same emotion to 1', async () => {
        const expected = {
          Post: [
            {
              emotionsCount: 1,
            },
          ],
        }
        await client.request(addPostEmotionsMutation, addPostEmotionsVariables)
        await client.request(addPostEmotionsMutation, addPostEmotionsVariables)
        await expect(
          client.request(postEmotionsCountQuery, postEmotionsQueryVariables),
        ).resolves.toEqual(expected)
      })

      it('allows a user to add more than one emotion', async () => {
        const expected = [
          { emotion: 'happy', User: { id: authorParams.id } },
          { emotion: 'surprised', User: { id: authorParams.id } },
        ]
        await client.request(addPostEmotionsMutation, addPostEmotionsVariables)
        addPostEmotionsVariables.data.emotion = 'surprised'
        await client.request(addPostEmotionsMutation, addPostEmotionsVariables)
        await expect(
          client.request(postEmotionsQuery, postEmotionsQueryVariables),
        ).resolves.toEqual({
          Post: [{ emotions: expect.arrayContaining(expected) }],
        })
      })
    })

    describe('authenticated as author', () => {
      let headers
      beforeEach(async () => {
        headers = await login(authorParams)
        client = new GraphQLClient(host, { headers })
      })

      it('adds an emotion to the post', async () => {
        const expected = {
          AddPostEmotions: {
            from: addPostEmotionsVariables.from,
            to: addPostEmotionsVariables.to,
            emotion: 'happy',
          },
        }
        await expect(
          client.request(addPostEmotionsMutation, addPostEmotionsVariables),
        ).resolves.toEqual(expected)
      })
    })
  })

  describe('RemovePostEmotions', () => {
    let removePostEmotionsVariables
    const removePostEmotionsMutation = `
      mutation($from: _UserInput!, $to: _PostInput!, $data: _EMOTEDInput!) {
        RemovePostEmotions(from: $from, to: $to, data: $data)
      }
    `
    beforeEach(() => {
      removePostEmotionsVariables = {
        from: { id: authorParams.id },
        to: { id: 'p1376' },
        data: { emotion: 'cry' },
      }
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(
          client.request(removePostEmotionsMutation, removePostEmotionsVariables),
        ).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated', () => {
      let headers
      beforeEach(async () => {
        headers = await login(authorParams)
        client = new GraphQLClient(host, { headers })
        await factory.emote({
          from: authorParams.id,
          to: 'p1376',
          data: 'cry',
        })
        await factory.emote({
          from: authorParams.id,
          to: 'p1376',
          data: 'happy',
        })
      })

      describe('but not the emoter', () => {
        it('throws an authorization error', async () => {
          removePostEmotionsVariables.from.id = userParams.id
          await expect(
            client.request(removePostEmotionsMutation, removePostEmotionsVariables),
          ).rejects.toThrow('Not Authorised')
        })
      })

      describe('as the emoter', () => {
        it('removes an emotion from a post', async () => {
          const expected = { RemovePostEmotions: true }
          await expect(
            client.request(removePostEmotionsMutation, removePostEmotionsVariables),
          ).resolves.toEqual(expected)
        })

        it('removes only the requested emotion, not all emotions', async () => {
          const expected = [{ emotion: 'happy', User: { id: authorParams.id } }]
          await client.request(removePostEmotionsMutation, removePostEmotionsVariables)
          await expect(
            client.request(postEmotionsQuery, postEmotionsQueryVariables),
          ).resolves.toEqual({
            Post: [{ emotions: expect.arrayContaining(expected) }],
          })
        })
      })
    })
  })
})
