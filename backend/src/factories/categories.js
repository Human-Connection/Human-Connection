import uuid from 'uuid/v4'

export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      const defaults = {
        id: uuid(),
        icon: 'img/badges/fundraisingbox_de_airship.svg',
        name: 'Some category name',
      }
      args = {
        ...defaults,
        ...args,
      }
      return neodeInstance.create('Category', args)
    },
  }
}
