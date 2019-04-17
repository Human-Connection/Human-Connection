import faker from 'faker'

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
