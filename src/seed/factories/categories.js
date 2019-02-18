import faker from 'faker'

export default function (params) {
  const {
    id = `cat${faker.random.number()}`,
    name,
    slug,
    icon
  } = params

  return `
    mutation {
      CreateCategory(
      id: "${id}",
      name: "${name}",
      slug: "${slug}",
      icon: "${icon}"
      ) { id, name }
    }
  `
}
