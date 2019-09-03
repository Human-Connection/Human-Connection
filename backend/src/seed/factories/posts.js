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
    categoryIds,
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
        $categoryIds: [ID]
      ) {
        CreatePost(
          id: $id
          slug: $slug
          title: $title
          content: $content
          image: $image
          visibility: $visibility
          deleted: $deleted
          categoryIds: $categoryIds
        ) {
          title
          content
        }
      }
    `,
    variables: { id, slug, title, content, image, visibility, deleted, categoryIds },
  }
}
