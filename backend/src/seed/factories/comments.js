import faker from 'faker'
import uuid from 'uuid/v4'

export default function (params) {
  const {
    postId = 'p6',
    content = [
      faker.lorem.sentence(),
      faker.lorem.sentence()
    ].join('. ')
  } = params

  return `
    mutation {
      CreateComment(
        postId: "${postId}",
        content: "${content}"
      ) { id, content }
    }
  `
}
