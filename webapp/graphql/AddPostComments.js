import gql from 'graphql-tag'

export default app => {
  return {
    AddPostComments: gql(`
      mutation($from: _CommentInput!, $to: _PostInput!) {
        AddPostComments(from: $from, to: $to) {
            from {
              id
            }
            to {
              id
            }
          }
        }
    `)
  }
}
