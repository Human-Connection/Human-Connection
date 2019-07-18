export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      const defaults = {
        type: 'crowdfunding',
        status: 'permanent',
      }
      args = {
        ...defaults,
        ...args,
      }
      return neodeInstance.create('Badge', args)
    },
  }
}
