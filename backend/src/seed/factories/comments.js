import faker from 'faker'
import uuid from 'uuid/v4'

export default function (params) {
  const {
    id = uuid(),
    postId = 'p6',
    content = [
      faker.lorem.sentence(),
      faker.lorem.sentence()
    ].join('. ')
  } = params

  return {
    mutation: `
      mutation($id: ID!, $postId: ID, $content: String!) {
        CreateComment(id: $id, postId: $postId, content: $content) {
          id
        }
      }
    `,
    variables: { id, postId, content }
  }
}
