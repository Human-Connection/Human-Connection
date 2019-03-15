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
          disabled
          deleted
          name
          slug
        }
        user {
          name
          slug
          disabled
          deleted
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
            disabled
            deleted
          }
          post {
            disabled
            deleted
            title
            slug
          }
          disabledBy {
            disabled
            deleted
            slug
            name
          }
        }
        post {
          title
          slug
          disabled
          deleted
          author {
            disabled
            deleted
            name
            slug
          }
          disabledBy {
            disabled
            deleted
            slug
            name
          }
        }
      }
    }
  `)
}
