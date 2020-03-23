import Resolver from './helpers/Resolver'
export default {
  Image: {
    ...Resolver('Image', {
      undefinedToNull: ['sensitive', 'alt', 'aspectRatio'],
    }),
  },
}
