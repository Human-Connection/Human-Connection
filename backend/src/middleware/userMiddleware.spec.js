import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'
import Factory from '../seed/factories'

const factory = Factory()
let client

afterAll(async () => {
  await factory.cleanDatabase()
})

describe('userMiddleware', () => {
  describe('create User', () => {
    const mutation = `
      mutation($id: ID, $password: String!, $email: String!) {
        CreateUser(id: $id, password: $password, email: $email) {
          id
        }
      }
    `
    client = new GraphQLClient(host)

    it('with password and email', async () => {
      const variables = {
        password: '123',
        email: '123@123.de'
      }
      const expected = {
        CreateUser: {
          id: expect.any(String)
        }
      }
      await expect(client.request(mutation, variables))
        .resolves.toEqual(expected)
    })

    it('with ID, email and password', async () => {
      const variables = {
        password: '123',
        id: 'u1',
        email: '123@123.de'
      }
      const expected = {
        CreateUser: {
          id: 'u1'
        }
      }
      await expect(client.request(mutation, variables))
        .resolves.toEqual(expected)
    })
  })
  describe('update User', () => {
    const mutation = `
      mutation($name: String) {
        UpdateUser(name: $name) {
          name
        }
      }
    `
    client = new GraphQLClient(host)

    it('name within specifications', async () => {
      const variables = {
        name: 'Peter Lustig'
      }
      const expected = {
        UpdateUser: {
          name: 'Peter Lustig'
        }
      }
      await expect(client.request(mutation, variables))
        .resolves.toEqual(expected)
    })

    it('with no name', async () => {
      const variables = {
      }
      const expected = 'Username must be at least 3 characters long!'
      await expect(client.request(mutation, variables))
        .rejects.toThrow(expected)
    })

    it('with too short name', async () => {
      const variables = {
      }
      const expected = 'Username must be at least 3 characters long!'
      await expect(client.request(mutation, variables))
        .rejects.toThrow(expected)
    })
  })
})

/*
let query
let action

beforeAll(async () => {
  // For performance reasons we do this only once
  await Promise.all([
    factory.create('User', { id: 'u1', role: 'user', email: 'user@example.org', password: '1234' }),
    factory.create('User', { id: 'm1', role: 'moderator', email: 'moderator@example.org', password: '1234' }),
    factory.create('User', { id: 'u2', role: 'user', name: 'Offensive Name', avatar: '/some/offensive/avatar.jpg', about: 'This self description is very offensive', email: 'troll@example.org', password: '1234' })
  ])

  await factory.authenticateAs({ email: 'user@example.org', password: '1234' })
  await Promise.all([
    factory.follow({ id: 'u2', type: 'User' }),
    factory.create('Post', { id: 'p1', title: 'Deleted post', deleted: true }),
    factory.create('Post', { id: 'p3', title: 'Publicly visible post', deleted: false })
  ])

  await Promise.all([
    factory.create('Comment', { id: 'c2', content: 'Enabled comment on public post' })
  ])

  await Promise.all([
    factory.relate('Comment', 'Author', { from: 'u1', to: 'c2' }),
    factory.relate('Comment', 'Post', { from: 'c2', to: 'p3' })
  ])

  const asTroll = Factory()
  await asTroll.authenticateAs({ email: 'troll@example.org', password: '1234' })
  await asTroll.create('Post', { id: 'p2', title: 'Disabled post', content: 'This is an offensive post content', image: '/some/offensive/image.jpg', deleted: false })
  await asTroll.create('Comment', { id: 'c1', content: 'Disabled comment' })
  await Promise.all([
    asTroll.relate('Comment', 'Author', { from: 'u2', to: 'c1' }),
    asTroll.relate('Comment', 'Post', { from: 'c1', to: 'p3' })
  ])

  const asModerator = Factory()
  await asModerator.authenticateAs({ email: 'moderator@example.org', password: '1234' })
  await asModerator.mutate('mutation { disable( id: "p2") }')
  await asModerator.mutate('mutation { disable( id: "c1") }')
  await asModerator.mutate('mutation { disable( id: "u2") }')
})

afterAll(async () => {
  await factory.cleanDatabase()
})

describe('softDeleteMiddleware', () => {
  describe('read disabled content', () => {
    let user
    let post
    let comment
    const beforeComment = async () => {
      query = '{ User(id: "u1") { following { comments { content contentExcerpt }  } } }'
      const response = await action()
      comment = response.User[0].following[0].comments[0]
    }
    const beforeUser = async () => {
      query = '{ User(id: "u1") { following { name about avatar } } }'
      const response = await action()
      user = response.User[0].following[0]
    }
    const beforePost = async () => {
      query = '{ User(id: "u1") { following { contributions { title image content contentExcerpt }  } } }'
      const response = await action()
      post = response.User[0].following[0].contributions[0]
    }

    action = () => {
      return client.request(query)
    }

    describe('as moderator', () => {
      beforeEach(async () => {
        const headers = await login({ email: 'moderator@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      describe('User', () => {
        beforeEach(beforeUser)

        it('displays name', () => expect(user.name).toEqual('Offensive Name'))
        it('displays about', () => expect(user.about).toEqual('This self description is very offensive'))
        it('displays avatar', () => expect(user.avatar).toEqual('/some/offensive/avatar.jpg'))
      })

      describe('Post', () => {
        beforeEach(beforePost)

        it('displays title', () => expect(post.title).toEqual('Disabled post'))
        it('displays content', () => expect(post.content).toEqual('This is an offensive post content'))
        it('displays contentExcerpt', () => expect(post.contentExcerpt).toEqual('This is an offensive post content'))
        it('displays image', () => expect(post.image).toEqual('/some/offensive/image.jpg'))
      })

      describe('Comment', () => {
        beforeEach(beforeComment)

        it('displays content', () => expect(comment.content).toEqual('Disabled comment'))
        it('displays contentExcerpt', () => expect(comment.contentExcerpt).toEqual('Disabled comment'))
      })
    })

    describe('as user', () => {
      beforeEach(async () => {
        const headers = await login({ email: 'user@example.org', password: '1234' })
        client = new GraphQLClient(host, { headers })
      })

      describe('User', () => {
        beforeEach(beforeUser)

        it('displays name', () => expect(user.name).toEqual('UNAVAILABLE'))
        it('obfuscates about', () => expect(user.about).toEqual('UNAVAILABLE'))
        it('obfuscates avatar', () => expect(user.avatar).toEqual('UNAVAILABLE'))
      })

      describe('Post', () => {
        beforeEach(beforePost)

        it('obfuscates title', () => expect(post.title).toEqual('UNAVAILABLE'))
        it('obfuscates content', () => expect(post.content).toEqual('UNAVAILABLE'))
        it('obfuscates contentExcerpt', () => expect(post.contentExcerpt).toEqual('UNAVAILABLE'))
        it('obfuscates image', () => expect(post.image).toEqual('UNAVAILABLE'))
      })

      describe('Comment', () => {
        beforeEach(beforeComment)

        it('obfuscates content', () => expect(comment.content).toEqual('UNAVAILABLE'))
        it('obfuscates contentExcerpt', () => expect(comment.contentExcerpt).toEqual('UNAVAILABLE'))
      })
    })
  })

  describe('Query', () => {
    describe('Post', () => {
      beforeEach(async () => {
        query = '{ Post { title } }'
      })

      describe('as user', () => {
        beforeEach(async () => {
          const headers = await login({ email: 'user@example.org', password: '1234' })
          client = new GraphQLClient(host, { headers })
        })

        it('hides deleted or disabled posts', async () => {
          const expected = { Post: [{ title: 'Publicly visible post' }] }
          await expect(action()).resolves.toEqual(expected)
        })
      })

      describe('as moderator', () => {
        beforeEach(async () => {
          const headers = await login({ email: 'moderator@example.org', password: '1234' })
          client = new GraphQLClient(host, { headers })
        })

        it('shows disabled but hides deleted posts', async () => {
          const expected = [
            { title: 'Disabled post' },
            { title: 'Publicly visible post' }
          ]
          const { Post } = await action()
          await expect(Post).toEqual(expect.arrayContaining(expected))
        })
      })

      describe('.comments', () => {
        beforeEach(async () => {
          query = '{ Post(id: "p3") { title comments { content } } }'
        })

        describe('as user', () => {
          beforeEach(async () => {
            const headers = await login({ email: 'user@example.org', password: '1234' })
            client = new GraphQLClient(host, { headers })
          })

          it('conceals disabled comments', async () => {
            const expected = [
              { content: 'Enabled comment on public post' },
              { content: 'UNAVAILABLE' }
            ]
            const { Post: [{ comments }] } = await action()
            await expect(comments).toEqual(expect.arrayContaining(expected))
          })
        })

        describe('as moderator', () => {
          beforeEach(async () => {
            const headers = await login({ email: 'moderator@example.org', password: '1234' })
            client = new GraphQLClient(host, { headers })
          })

          it('shows disabled comments', async () => {
            const expected = [
              { content: 'Enabled comment on public post' },
              { content: 'Disabled comment' }
            ]
            const { Post: [{ comments }] } = await action()
            await expect(comments).toEqual(expect.arrayContaining(expected))
          })
        })
      })

      describe('filter (deleted: true)', () => {
        beforeEach(() => {
          query = '{ Post(deleted: true) { title } }'
        })

        describe('as user', () => {
          beforeEach(async () => {
            const headers = await login({ email: 'user@example.org', password: '1234' })
            client = new GraphQLClient(host, { headers })
          })

          it('throws authorisation error', async () => {
            await expect(action()).rejects.toThrow('Not Authorised!')
          })
        })

        describe('as moderator', () => {
          beforeEach(async () => {
            const headers = await login({ email: 'moderator@example.org', password: '1234' })
            client = new GraphQLClient(host, { headers })
          })

          it('shows deleted posts', async () => {
            const expected = { Post: [{ title: 'Deleted post' }] }
            await expect(action()).resolves.toEqual(expected)
          })
        })
      })

      describe('filter (disabled: true)', () => {
        beforeEach(() => {
          query = '{ Post(disabled: true) { title } }'
        })

        describe('as user', () => {
          beforeEach(async () => {
            const headers = await login({ email: 'user@example.org', password: '1234' })
            client = new GraphQLClient(host, { headers })
          })

          it('throws authorisation error', async () => {
            await expect(action()).rejects.toThrow('Not Authorised!')
          })
        })

        describe('as moderator', () => {
          beforeEach(async () => {
            const headers = await login({ email: 'moderator@example.org', password: '1234' })
            client = new GraphQLClient(host, { headers })
          })

          it('shows disabled posts', async () => {
            const expected = { Post: [{ title: 'Disabled post' }] }
            await expect(action()).resolves.toEqual(expected)
          })
        })
      })
    })
  })
})
*/