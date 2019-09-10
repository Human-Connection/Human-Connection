import faker from 'faker'

export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      const defaults = {
        email: faker.internet.email(),
        verifiedAt: new Date().toISOString(),
      }
      args = {
        ...defaults,
        ...args,
      }
      return neodeInstance.create('EmailAddress', args)
    },
  }
}
