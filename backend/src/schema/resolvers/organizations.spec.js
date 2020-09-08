import { createTestClient } from 'apollo-server-testing'
import Factory, { cleanDatabase } from '../../db/factories'
import { gql } from '../../helpers/jest'
import { getNeode, getDriver } from '../../db/neo4j'
import createServer from '../../server'

const driver = getDriver()
const neode = getNeode()

let mutate
let authenticatedUser
let user

const categoryIds = ['cat9', 'cat4', 'cat15']
let variables

const createOrganizationMutation = gql`
  mutation($id: ID, $name: String!, $description: String!, $categoryIds: [ID]) {
    CreateOrganization(id: $id, name: $name, description: $description, categoryIds: $categoryIds) {
      id
      name
      description
      slug
      creator {
        name
      }
    }
  }
`

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
  mutate = createTestClient(server).mutate
})

beforeEach(async () => {
  variables = {}
  user = await Factory.build(
    'user',
    {
      id: 'current-user',
      name: 'TestUser',
    },
    {
      email: 'test@example.org',
      password: '1234',
    },
  )
  await Promise.all([
    neode.create('Category', {
      id: 'cat9',
      name: 'Democracy & Politics',
      icon: 'university',
    }),
    neode.create('Category', {
      id: 'cat4',
      name: 'Environment & Nature',
      icon: 'tree',
    }),
    neode.create('Category', {
      id: 'cat15',
      name: 'Consumption & Sustainability',
      icon: 'shopping-cart',
    }),
    neode.create('Category', {
      id: 'cat27',
      name: 'Animal Protection',
      icon: 'paw',
    }),
  ])
  authenticatedUser = null
})

afterEach(async () => {
  await cleanDatabase()
})

describe('CreateOrganization', () => {
  beforeEach(() => {
    variables = {
      ...variables,
      id: 'o3589',
      name: 'I am the name of the organization',
      description: 'Some description',
      categoryIds,
    }
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      const { errors } = await mutate({ mutation: createOrganizationMutation, variables })
      expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      authenticatedUser = await user.toJson()
    })

    it('creates a organization', async () => {
      const expected = {
        data: {
          CreateOrganization: {
            name: 'I am the name of the organization',
            description: 'Some description',
          },
        },
        errors: undefined,
      }
      await expect(
        mutate({ mutation: createOrganizationMutation, variables }),
      ).resolves.toMatchObject(expected)
    })

    it('assigns the authenticated user as creator', async () => {
      const expected = {
        data: {
          CreateOrganization: {
            name: 'I am the name of the organization',
            creator: {
              name: 'TestUser',
            },
          },
        },
        errors: undefined,
      }
      await expect(
        mutate({ mutation: createOrganizationMutation, variables }),
      ).resolves.toMatchObject(expected)
    })
  })
})

describe('UpdateOrganization', () => {
  let creator, newlyCreatedOrganization
  const updateOrganizationMutation = gql`
    mutation($id: ID!, $name: String!, $description: String!, $categoryIds: [ID]) {
      UpdateOrganization(
        id: $id
        name: $name
        description: $description
        categoryIds: $categoryIds
      ) {
        id
        name
        description
        creator {
          name
          slug
        }
        categories {
          id
        }
        createdAt
        updatedAt
      }
    }
  `
  beforeEach(async () => {
    creator = await Factory.build('user', { slug: 'the-creator' })
    newlyCreatedOrganization = await Factory.build(
      'organization',
      {
        id: 'o9876',
        name: 'Old name',
        description: 'Old description',
      },
      {
        creator,
        categoryIds,
      },
    )

    variables = {
      id: 'o9876',
      name: 'New name',
      description: 'New description',
    }
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      authenticatedUser = null
      expect(mutate({ mutation: updateOrganizationMutation, variables })).resolves.toMatchObject({
        errors: [{ message: 'Not Authorised!' }],
        data: { UpdateOrganization: null },
      })
    })
  })

  describe('authenticated but not the creator', () => {
    beforeEach(async () => {
      authenticatedUser = await user.toJson()
    })

    it('throws authorization error', async () => {
      const { errors } = await mutate({ mutation: updateOrganizationMutation, variables })
      expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
  })

  describe('authenticated as creator', () => {
    beforeEach(async () => {
      authenticatedUser = await creator.toJson()
    })

    it('updates a organization', async () => {
      const expected = {
        data: { UpdateOrganization: { id: 'o9876', name: 'New name' } },
        errors: undefined,
      }
      await expect(
        mutate({ mutation: updateOrganizationMutation, variables }),
      ).resolves.toMatchObject(expected)
    })

    it('updates a organization, but maintains non-updated attributes', async () => {
      const expected = {
        data: {
          UpdateOrganization: { id: 'o9876', name: 'New name', createdAt: expect.any(String) },
        },
        errors: undefined,
      }
      await expect(
        mutate({ mutation: updateOrganizationMutation, variables }),
      ).resolves.toMatchObject(expected)
    })

    it('updates the updatedAt attribute', async () => {
      newlyCreatedOrganization = await newlyCreatedOrganization.toJson()
      const {
        data: { UpdateOrganization },
      } = await mutate({ mutation: updateOrganizationMutation, variables })
      expect(newlyCreatedOrganization.updatedAt).toBeTruthy()
      expect(Date.parse(newlyCreatedOrganization.updatedAt)).toEqual(expect.any(Number))
      expect(UpdateOrganization.updatedAt).toBeTruthy()
      expect(Date.parse(UpdateOrganization.updatedAt)).toEqual(expect.any(Number))
      expect(newlyCreatedOrganization.updatedAt).not.toEqual(UpdateOrganization.updatedAt)
    })

    describe('no new category ids provided for update', () => {
      it('resolves and keeps current categories', async () => {
        const expected = {
          data: {
            UpdateOrganization: {
              id: 'o9876',
              categories: expect.arrayContaining([{ id: 'cat9' }, { id: 'cat4' }, { id: 'cat15' }]),
            },
          },
          errors: undefined,
        }
        await expect(
          mutate({ mutation: updateOrganizationMutation, variables }),
        ).resolves.toMatchObject(expected)
      })
    })

    describe('given category ids', () => {
      beforeEach(() => {
        variables = { ...variables, categoryIds: ['cat27'] }
      })

      it('updates categories of a organization', async () => {
        const expected = {
          data: {
            UpdateOrganization: {
              id: 'o9876',
              categories: expect.arrayContaining([{ id: 'cat27' }]),
            },
          },
          errors: undefined,
        }
        await expect(
          mutate({ mutation: updateOrganizationMutation, variables }),
        ).resolves.toMatchObject(expected)
      })
    })
  })
})
