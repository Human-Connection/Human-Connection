import faker from 'faker'
import uuid from 'uuid/v4'

export default function (params) {
  const {
    id = uuid(),
    postId = uuid(),
    content = [
      faker.lorem.sentence(),
      faker.lorem.sentence()
    ].join('. ')
  } = params

  return `
    mutation {
      CreateComment(
        id: "${id}",
        postId: "${postId}",
        content: "${content}"
      ) { id, content }
    }
  `
}
