import gql from 'graphql-tag'

export default app => {
  return gql(`
    query {
      Report(first: 20, orderBy: createdAt_desc) {
        id
        description
        type
        createdAt
        submitter {
          name
          slug
        }
        user {
          name
          slug
          disabledBy {
            slug
            name
          }
        }
        comment {
          contentExcerpt
          author {
            name
            slug
          }
          post {
            title
            slug
          }
          disabledBy {
            slug
            name
          }
        }
        post {
          title
          slug
          author {
            name
            slug
          }
          disabledBy {
            slug
            name
          }
        }
      }
    }
  `)
}
