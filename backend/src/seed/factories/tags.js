import uuid from 'uuid/v4'

export default function (params) {
  const {
    id = uuid(),
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
