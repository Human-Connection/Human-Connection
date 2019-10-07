import faker from 'faker'

export function defaults({ args }) {
  const defaults = {
    email: faker.internet.email(),
    verifiedAt: new Date().toISOString(),
  }
  args = {
    ...defaults,
    ...args,
  }
  return args
}

export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      args = defaults({ args })
      return neodeInstance.create('EmailAddress', args)
    },
  }
}
