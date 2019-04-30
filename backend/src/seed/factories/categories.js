import uuid from 'uuid/v4'

export default function (params) {
  const {
    id = uuid(),
    name,
    slug,
    icon
  } = params

  return {
    mutation: `
    mutation($id: ID, $name: String!, $slug: String, $icon: String!) {
      CreateCategory(id: $id, name: $name, slug: $slug, icon: $icon) {
        id
        name
      }
    }
    `,
    variables: { id, name, slug, icon }
  }
}
