import gql from 'graphql-tag'

export default () => {
  return {
    CreateComment: gql`
      mutation($postId: ID!, $content: String!) {
        CreateComment(postId: $postId, content: $content) {
          id
          contentExcerpt
          content
          author {
            id
            slug
            name
            avatar
          }
          createdAt
          deleted
          disabled
        }
      }
    `,
    UpdateComment: gql`
      mutation($content: String!, $id: ID!) {
        UpdateComment(content: $content, id: $id) {
          id
          content
          contentExcerpt
        }
      }
    `,
  }
}
