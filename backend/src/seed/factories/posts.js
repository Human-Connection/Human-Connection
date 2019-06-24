import casual from 'casual'
import uuid from 'uuid/v4'

casual.define('image', function() {
  return {
    url: 'https://loremflickr.com/640/480',
  }
})
export default function(params) {
  const {
    id = uuid(),
    slug = '',
    title = casual.title,
    content = [
      casual.sentence,
      casual.sentence,
      casual.sentence,
      casual.sentence,
      casual.sentence,
    ].join('. '),
    image = casual.image.url,
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
