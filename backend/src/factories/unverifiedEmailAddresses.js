import { defaults } from './emailAddresses.js'

export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      args = defaults({ args })
      return neodeInstance.create('UnverifiedEmailAddress', args)
    },
  }
}
