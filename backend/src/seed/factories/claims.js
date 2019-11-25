export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      return neodeInstance.create('Claim', args)
    },
  }
}
