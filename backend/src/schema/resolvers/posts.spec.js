import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login } from '../../jest/helpers'

const factory = Factory()
let client
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
    }
  }
`
const creatPostWithCategoriesVariables = {
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
beforeEach(async () => {
  await factory.create('User', {
    email: 'test@example.org',
    password: '1234',
  })
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
      headers = await login({ email: 'test@example.org', password: '1234' })
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
          User(email:"test@example.org") {
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
      it('allows a user to set the categories of the post', async () => {
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
        const expected = [{ id: 'cat9' }, { id: 'cat4' }, { id: 'cat15' }]
        const postWithCategories = await client.request(
          createPostWithCategoriesMutation,
          creatPostWithCategoriesVariables,
        )
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

describe('UpdatePost', () => {
  let updatePostMutation
  let updatePostVariables
  beforeEach(async () => {
    const asAuthor = Factory()
    await asAuthor.create('User', {
      email: 'author@example.org',
      password: '1234',
    })
    await asAuthor.authenticateAs({
      email: 'author@example.org',
      password: '1234',
    })
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
      headers = await login({ email: 'test@example.org', password: '1234' })
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
      headers = await login({ email: 'author@example.org', password: '1234' })
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
          creatPostWithCategoriesVariables,
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
    await asAuthor.create('User', {
      email: 'author@example.org',
      password: '1234',
    })
    await asAuthor.authenticateAs({
      email: 'author@example.org',
      password: '1234',
    })
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
      headers = await login({ email: 'test@example.org', password: '1234' })
      client = new GraphQLClient(host, { headers })
    })

    it('throws authorization error', async () => {
      await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
    })
  })

  describe('authenticated as author', () => {
    let headers
    beforeEach(async () => {
      headers = await login({ email: 'author@example.org', password: '1234' })
      client = new GraphQLClient(host, { headers })
    })

    it('deletes a post', async () => {
      const expected = { DeletePost: { id: 'p1', content: 'To be deleted' } }
      await expect(client.request(mutation, variables)).resolves.toEqual(expected)
    })
  })
})
