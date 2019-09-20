import Factory from '../seed/factories'
import { neode } from '../bootstrap/neo4j'

const factory = Factory()
const instance = neode()

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('role', () => {
  it('defaults to `user`', async () => {
    const user = await instance.create('User', { name: 'John' })
    await expect(user.toJson()).resolves.toEqual(
      expect.objectContaining({
        role: 'user',
      }),
    )
  })
})

describe('slug', () => {
  it('normalizes to lowercase letters', async () => {
    const user = await instance.create('User', { slug: 'Matt' })
    await expect(user.toJson()).resolves.toEqual(
      expect.objectContaining({
        slug: 'matt',
      }),
    )
  })

  describe('characters', () => {
    const createUser = attrs => {
      return instance.create('User', attrs).then(user => user.toJson())
    }

    it('-', async () => {
      await expect(createUser({ slug: 'matt-rider' })).resolves.toMatchObject({
        slug: 'matt-rider',
      })
    })

    it('_', async () => {
      await expect(createUser({ slug: 'matt_rider' })).resolves.toMatchObject({
        slug: 'matt_rider',
      })
    })

    it(' ', async () => {
      await expect(createUser({ slug: 'matt rider' })).rejects.toThrow(
        /fails to match the required pattern/,
      )
    })

    it('ä', async () => {
      await expect(createUser({ slug: 'mätt' })).rejects.toThrow(
        /fails to match the required pattern/,
      )
    })
  })
})
