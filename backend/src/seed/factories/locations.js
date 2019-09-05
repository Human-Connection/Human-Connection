export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      const defaults = {
        name: 'Germany',
        namePT: 'Alemanha',
        nameDE: 'Deutschland',
        nameES: 'Alemania',
        nameNL: 'Duitsland',
        namePL: 'Niemcy',
        nameFR: 'Allemagne',
        nameIT: 'Germania',
        nameEN: 'Germany',
        id: 'country.10743216036480410',
        type: 'country',
      }
      args = {
        ...defaults,
        ...args,
      }
      return neodeInstance.create('Location', args)
    },
  }
}
