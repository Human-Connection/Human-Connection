import faker from 'faker'

export default function (params) {
  const {
    id = `t${faker.random.number()}`,
    name
  } = params

  return `
    mutation {
      CreateTag(
      id: "${id}",
      name: "${name}",
      ) { name }
    }
  `
}
