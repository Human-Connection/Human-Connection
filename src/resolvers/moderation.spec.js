import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()
let client

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('disable', () => {
  const setup = async (params = {}) => {
    await factory.create('User', { email: 'author@example.org', password: '1234' })
    await factory.authenticateAs({ email: 'author@example.org', password: '1234' })
    await factory.create('Post', {
      id: 'p9' // that's the ID we will look for
    })

    // create the user we use in the scenario below
    let headers = {}
    const { email, password } = params
    if (email && password) {
      await factory.create('User', params)
      headers = await login({ email, password })
    }
    client = new GraphQLClient(host, { headers })
  }

  const mutation = `
    mutation {
      disable(resource: {
        id: "p9"
        type: contribution
      })
    }
  `

  it('throws authorization error', async () => {
    await setup()
    await expect(client.request(mutation)).rejects.toThrow('Not Authorised')
  })

  describe('authenticated', () => {
    it('throws authorization error', async () => {
      await setup({
        email: 'someUser@example.org',
        password: '1234'
      })
      await expect(client.request(mutation)).rejects.toThrow('Not Authorised')
    })

    describe('as moderator', () => {
      beforeEach(async () => {
        await setup({
          id: 'u7',
          email: 'moderator@example.org',
          password: '1234',
          role: 'moderator'
        })
      })

      it('returns true', async () => {
        const expected = { disable: true }
        await expect(client.request(mutation)).resolves.toEqual(expected)
      })

      it('changes .disabledBy', async () => {
        const before = { Post: [{ id: 'p9', disabledBy: null }] }
        const expected = { Post: [{ id: 'p9', disabledBy: { id: 'u7' } }] }

        await expect(client.request(
          '{ Post { id,  disabledBy { id } } }'
        )).resolves.toEqual(before)
        await client.request(mutation)
        await expect(client.request(
          '{ Post(disabled: true) { id,  disabledBy { id } } }'
        )).resolves.toEqual(expected)
      })

      it('updates .disabled on post', async () => {
        const before = { Post: [ { id: 'p9', disabled: false } ] }
        const expected = { Post: [ { id: 'p9', disabled: true } ] }

        await expect(client.request(
          '{ Post { id disabled } }'
        )).resolves.toEqual(before)
        await client.request(mutation) // this updates .disabled
        await expect(client.request(
          '{ Post(disabled: true) { id disabled } }'
        )).resolves.toEqual(expected)
      })
    })
  })
})

describe('enable', () => {
  const setup = async (params = {}) => {
    await factory.create('User', { email: 'anotherModerator@example.org', password: '1234', id: 'u123', role: 'moderator' })
    await factory.authenticateAs({ email: 'anotherModerator@example.org', password: '1234' })
    await factory.create('Post', {
      id: 'p9' // that's the ID we will look for
    })
    const disableMutation = `
      mutation {
        disable(resource: {
          id: "p9"
          type: contribution
        })
      }
    `
    await factory.mutate(disableMutation) // that's we want to delete

    let headers = {}
    const { email, password } = params
    if (email && password) {
      await factory.create('User', params)
      headers = await login({ email, password })
    }
    client = new GraphQLClient(host, { headers })
  }

  const mutation = `
    mutation {
      enable(resource: {
        id: "p9"
        type: contribution
      })
    }
  `

  it('throws authorization error', async () => {
    await setup()
    await expect(client.request(mutation)).rejects.toThrow('Not Authorised')
  })

  describe('authenticated', () => {
    it('throws authorization error', async () => {
      await setup({
        email: 'someUser@example.org',
        password: '1234'
      })
      await expect(client.request(mutation)).rejects.toThrow('Not Authorised')
    })

    describe('as moderator', () => {
      beforeEach(async () => {
        await setup({
          role: 'moderator',
          email: 'someUser@example.org',
          password: '1234'
        })
      })

      it('returns true', async () => {
        const expected = { enable: true }
        await expect(client.request(mutation)).resolves.toEqual(expected)
      })

      it('changes .disabledBy', async () => {
        const before = { Post: [{ id: 'p9', disabledBy: { id: 'u123' } }] }
        const expected = { Post: [{ id: 'p9', disabledBy: null }] }

        await expect(client.request(
          '{ Post(disabled: true) { id,  disabledBy { id } } }'
        )).resolves.toEqual(before)
        await client.request(mutation)
        await expect(client.request(
          '{ Post { id,  disabledBy { id } } }'
        )).resolves.toEqual(expected)
      })

      it('updates .disabled on post', async () => {
        const before = { Post: [ { id: 'p9', disabled: true } ] }
        const expected = { Post: [ { id: 'p9', disabled: false } ] }

        await expect(client.request(
          '{ Post(disabled: true) { id disabled } }'
        )).resolves.toEqual(before)
        await client.request(mutation) // this updates .disabled
        await expect(client.request(
          '{ Post { id disabled } }'
        )).resolves.toEqual(expected)
      })
    })
  })
})
