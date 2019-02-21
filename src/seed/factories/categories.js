import uuid from 'uuid/v4'

export default function (params) {
  const {
    id = uuid(),
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
