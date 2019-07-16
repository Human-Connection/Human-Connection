import gql from 'graphql-tag'

export default () => {
  return {
    CreatePost: gql`
      mutation(
        $title: String!
        $content: String!
        $language: String
        $categoryIds: [ID]
        $imageUpload: Upload
      ) {
        CreatePost(
          title: $title
          content: $content
          language: $language
          categoryIds: $categoryIds
          imageUpload: $imageUpload
        ) {
          title
          slug
          content
          contentExcerpt
          language
        }
      }
    `,
    UpdatePost: gql`
      mutation(
        $id: ID!
        $title: String!
        $content: String!
        $language: String
        $imageUpload: Upload
        $categoryIds: [ID]
        $image: String
      ) {
        UpdatePost(
          id: $id
          title: $title
          content: $content
          language: $language
          imageUpload: $imageUpload
          categoryIds: $categoryIds
          image: $image
        ) {
          id
          title
          slug
          content
          contentExcerpt
          language
        }
      }
    `,
    DeletePost: gql`
      mutation($id: ID!) {
        DeletePost(id: $id) {
          id
        }
      }
    `,
  }
}
