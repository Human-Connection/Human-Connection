import gql from 'graphql-tag'

export default app => {
  return gql(`
    query CommentByPost($postId: ID!) {
      CommentByPost(postId: $postId, orderBy: createdAt_desc) {
        id
        contentExcerpt
        createdAt
      }
    }
  `)
}
