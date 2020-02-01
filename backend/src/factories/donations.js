import uuid from 'uuid/v4'

export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      const defaults = {
        id: uuid(),
        goal: 15000,
        progress: 0,
      }
      args = {
        ...defaults,
        ...args,
      }
      return neodeInstance.create('Donations', args)
    },
  }
}
