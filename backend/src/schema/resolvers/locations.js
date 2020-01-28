import Resolver from './helpers/Resolver'

export default {
  Location: {
    ...Resolver('Location', {
      undefinedToNull: [
        'nameEN',
        'nameDE',
        'nameFR',
        'nameNL',
        'nameIT',
        'nameES',
        'namePT',
        'namePL',
        'nameRU',
      ],
    }),
  },
}
