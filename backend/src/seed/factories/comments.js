import faker from 'faker'
import uuid from 'uuid/v4'

export default function (params) {
  const {
    id = uuid(),
    content = [
      faker.lorem.sentence(),
      faker.lorem.sentence()
    ].join('. ')
  } = params

  return `
    mutation {
      CreateComment(
        id: "${id}",
        content: "${content}"
      ) { id, content }
    }
  `
}
