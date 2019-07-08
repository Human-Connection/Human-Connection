import Factory from '../../seed/factories'
import { neode } from '../../bootstrap/neo4j'

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
