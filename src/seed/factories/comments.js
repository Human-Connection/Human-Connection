import faker from 'faker'
import uuid from 'uuid/v4'

export default function (params) {
  const {
    id = uuid(),
    content = [
      faker.lorem.sentence(),
      faker.lorem.sentence()
    ].join('. '),
    disabled = false,
    deleted = false
  } = params

  return `
    mutation {
      CreateComment(
        id: "${id}",
        content: "${content}",
        disabled: ${disabled},
        deleted: ${deleted}
      ) { id }
    }
  `
}
