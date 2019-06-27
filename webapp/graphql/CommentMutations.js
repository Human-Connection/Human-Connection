import gql from 'graphql-tag'

export default () => {
  return {
    CreateComment: gql`
      mutation($postId: ID, $content: String!) {
        CreateComment(postId: $postId, content: $content) {
          id
          contentExcerpt
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
  }
}
