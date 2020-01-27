export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      const defaults = { name: '#human-connection' }
      args = {
        ...defaults,
        ...args,
      }
      return neodeInstance.create('Tag', args)
    },
  }
}
