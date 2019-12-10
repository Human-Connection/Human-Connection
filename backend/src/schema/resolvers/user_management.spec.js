import jwt from 'jsonwebtoken'
import CONFIG from './../../config'
import Factory from '../../seed/factories'
import { gql } from '../../helpers/jest'
import { createTestClient } from 'apollo-server-testing'
import createServer, { context } from '../../server'
import encode from '../../jwt/encode'
import { getNeode } from '../../bootstrap/neo4j'

const factory = Factory()
const neode = getNeode()
let query, mutate, variables, req, user

const disable = async id => {
  const moderator = await factory.create('User', { id: 'u2', role: 'moderator' })
  const user = await neode.find('User', id)
  const reportAgainstUser = await factory.create('Report')
  await Promise.all([
    reportAgainstUser.relateTo(moderator, 'filed', {
      resourceId: id,
      reasonCategory: 'discrimination_etc',
      reasonDescription: 'This user is harassing me with bigoted remarks!',
    }),
    reportAgainstUser.relateTo(user, 'belongsTo'),
  ])
  const disableVariables = { resourceId: user.id, disable: true, closed: false }
  await Promise.all([
    reportAgainstUser.relateTo(moderator, 'reviewed', disableVariables),
    user.update({ disabled: true, updatedAt: new Date().toISOString() }),
  ])
}

beforeEach(() => {
  user = null
  req = { headers: {} }
})

beforeAll(() => {
  const { server } = createServer({
    context: () => {
      // One of the rare occasions where we test
      // the actual `context` implementation here
      return context({ req })
    },
  })
  query = createTestClient(server).query
  mutate = createTestClient(server).mutate
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('isLoggedIn', () => {
  const isLoggedInQuery = gql`
    {
      isLoggedIn
    }
  `
  const respondsWith = async expected => {
    await expect(query({ query: isLoggedInQuery })).resolves.toMatchObject(expected)
  }

  describe('unauthenticated', () => {
    it('returns false', async () => {
      await respondsWith({ data: { isLoggedIn: false } })
    })
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      user = await factory.create('User', { id: 'u3' })
      const userBearerToken = encode({ id: 'u3' })
      req = { headers: { authorization: `Bearer ${userBearerToken}` } }
    })

    it('returns true', async () => {
      await respondsWith({ data: { isLoggedIn: true } })
    })

    describe('but user is disabled', () => {
      beforeEach(async () => {
        await disable('u3')
      })

      it('returns false', async () => {
        await respondsWith({ data: { isLoggedIn: false } })
      })
    })

    describe('but user is deleted', () => {
      beforeEach(async () => {
        await user.update({ updatedAt: new Date().toISOString(), deleted: true })
      })

      it('returns false', async () => {
        await respondsWith({ data: { isLoggedIn: false } })
      })
    })
  })
})

describe('currentUser', () => {
  const currentUserQuery = gql`
    {
      currentUser {
        id
        slug
        name
        avatar
        email
        role
      }
    }
  `

  const respondsWith = async expected => {
    await expect(query({ query: currentUserQuery, variables })).resolves.toMatchObject(expected)
  }

  describe('unauthenticated', () => {
    it('returns null', async () => {
      await respondsWith({ data: { currentUser: null } })
    })
  })

  describe('authenticated', () => {
    describe('and corresponding user in the database', () => {
      beforeEach(async () => {
        await factory.create('User', {
          id: 'u3',
          // the `id` is the only thing that has to match the decoded JWT bearer token
          avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/jimmuirhead/128.jpg',
          email: 'test@example.org',
          name: 'Matilde Hermiston',
          slug: 'matilde-hermiston',
          role: 'user',
        })
        const userBearerToken = encode({ id: 'u3' })
        req = { headers: { authorization: `Bearer ${userBearerToken}` } }
      })

      it('returns the whole user object', async () => {
        const expected = {
          data: {
            currentUser: {
              id: 'u3',
              avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/jimmuirhead/128.jpg',
              email: 'test@example.org',
              name: 'Matilde Hermiston',
              slug: 'matilde-hermiston',
              role: 'user',
            },
          },
        }
        await respondsWith(expected)
      })
    })
  })
})

describe('login', () => {
  const loginMutation = gql`
    mutation($email: String!, $password: String!) {
      login(email: $email, password: $password)
    }
  `

  const respondsWith = async expected => {
    await expect(mutate({ mutation: loginMutation, variables })).resolves.toMatchObject(expected)
  }

  beforeEach(async () => {
    variables = { email: 'test@example.org', password: '1234' }
    user = await factory.create('User', {
      ...variables,
      id: 'acb2d923-f3af-479e-9f00-61b12e864666',
    })
  })

  describe('ask for a `token`', () => {
    describe('with a valid email/password combination', () => {
      it('responds with a JWT bearer token', async done => {
        const {
          data: { login: token },
        } = await mutate({ mutation: loginMutation, variables })
        jwt.verify(token, CONFIG.JWT_SECRET, (err, data) => {
          expect(data.email).toEqual('test@example.org')
          expect(err).toBeNull()
          done()
        })
      })

      describe('but user account is deleted', () => {
        beforeEach(async () => {
          await user.update({ updatedAt: new Date().toISOString(), deleted: true })
        })

        it('responds with "Incorrect email address or password."', async () => {
          await respondsWith({
            data: null,
            errors: [{ message: 'Incorrect email address or password.' }],
          })
        })
      })

      describe('but user account is disabled', () => {
        beforeEach(async () => {
          await disable('acb2d923-f3af-479e-9f00-61b12e864666')
        })

        it('responds with "Your account has been disabled."', async () => {
          await respondsWith({
            data: null,
            errors: [{ message: 'Your account has been disabled.' }],
          })
        })
      })

      describe('normalization', () => {
        describe('email address is a gmail address ', () => {
          beforeEach(async () => {
            const email = await neode.first('EmailAddress', { email: 'test@example.org' })
            await email.update({ email: 'someuser@gmail.com' })
          })

          describe('supplied email contains dots', () => {
            beforeEach(() => {
              variables = { ...variables, email: 'some.user@gmail.com' }
            })

            it('normalizes email, issue #2329', async () => {
              await respondsWith({
                data: { login: expect.any(String) },
                errors: undefined,
              })
            })
          })
        })
      })
    })

    describe('with a valid email but incorrect password', () => {
      beforeEach(() => {
        variables = { ...variables, email: 'test@example.org', password: 'wrong' }
      })

      it('responds with "Incorrect email address or password."', async () => {
        await respondsWith({
          errors: [{ message: 'Incorrect email address or password.' }],
        })
      })
    })

    describe('with a non-existing email', () => {
      beforeEach(() => {
        variables = {
          ...variables,
          email: 'non-existent@example.org',
          password: '1234',
        }
      })

      it('responds with "Incorrect email address or password."', async () => {
        await respondsWith({
          errors: [{ message: 'Incorrect email address or password.' }],
        })
      })
    })
  })
})

describe('change password', () => {
  const changePasswordMutation = gql`
    mutation($oldPassword: String!, $newPassword: String!) {
      changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
    }
  `

  const respondsWith = async expected => {
    await expect(mutate({ mutation: changePasswordMutation, variables })).resolves.toMatchObject(
      expected,
    )
  }

  beforeEach(async () => {
    variables = { ...variables, oldPassword: 'what', newPassword: 'ever' }
  })

  describe('unauthenticated', () => {
    it('throws "Not Authorised!"', async () => {
      await respondsWith({ errors: [{ message: 'Not Authorised!' }] })
    })
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      await factory.create('User', { id: 'u3' })
      const userBearerToken = encode({ id: 'u3' })
      req = { headers: { authorization: `Bearer ${userBearerToken}` } }
    })
    describe('old password === new password', () => {
      beforeEach(() => {
        variables = { ...variables, oldPassword: '1234', newPassword: '1234' }
      })

      it('responds with "Old password and new password should be different"', async () => {
        await respondsWith({
          errors: [{ message: 'Old password and new password should be different' }],
        })
      })
    })

    describe('incorrect old password', () => {
      beforeEach(() => {
        variables = {
          ...variables,
          oldPassword: 'notOldPassword',
          newPassword: '12345',
        }
      })

      it('responds with "Old password isn\'t valid"', async () => {
        await respondsWith({ errors: [{ message: 'Old password is not correct' }] })
      })
    })

    describe('correct password', () => {
      beforeEach(() => {
        variables = {
          ...variables,
          oldPassword: '1234',
          newPassword: '12345',
        }
      })

      it('changes the password if given correct credentials "', async () => {
        await respondsWith({ data: { changePassword: expect.any(String) } })
      })
    })
  })
})
