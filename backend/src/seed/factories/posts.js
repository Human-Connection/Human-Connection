import faker from 'faker'
import uuid from 'uuid/v4'

export default function(params) {
  const {
    id = uuid(),
    slug = '',
    title = faker.lorem.sentence(),
    content = [
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.lorem.sentence(),
    ].join('. '),
    image = faker.image.unsplash.imageUrl(),
    visibility = 'public',
    deleted = false,
  } = params

  return {
    mutation: `
      mutation(
        $id: ID!
        $slug: String
        $title: String!
        $content: String!
        $image: String
        $visibility: Visibility
        $deleted: Boolean
      ) {
        CreatePost(
          id: $id
          slug: $slug
          title: $title
          content: $content
          image: $image
          visibility: $visibility
          deleted: $deleted
        ) {
          title
          content
        }
      }
    `,
    variables: { id, slug, title, content, image, visibility, deleted },
  }
}
