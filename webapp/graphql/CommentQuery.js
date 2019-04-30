import gql from 'graphql-tag'

export default app => {
  return gql(`
  query CommentByPost($postId: ID!) {
      CommentByPost(postId: $postId) {
        id
        contentExcerpt
        createdAt
      }
    }
  `)
}
