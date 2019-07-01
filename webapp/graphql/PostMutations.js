import gql from 'graphql-tag'

export default () => {
  return {
    CreatePost: gql`
      mutation($title: String!, $content: String!, $language: String, $imageUpload: Upload) {
        CreatePost(
          title: $title
          content: $content
          language: $language
          imageUpload: $imageUpload
        ) {
          id
          title
          slug
          content
          contentExcerpt
          language
          imageUpload
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
      ) {
        UpdatePost(
          id: $id
          title: $title
          content: $content
          language: $language
          imageUpload: $imageUpload
        ) {
          id
          title
          slug
          content
          contentExcerpt
          language
          imageUpload
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
