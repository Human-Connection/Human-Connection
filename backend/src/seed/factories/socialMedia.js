export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      const defaults = {
        url: 'https://mastodon.social/@Gargron',
      }
      args = {
        ...defaults,
        ...args,
      }
      return neodeInstance.create('SocialMedia', args)
    },
  }
}
