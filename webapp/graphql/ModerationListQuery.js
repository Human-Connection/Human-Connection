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
          id
          disabled
          deleted
          name
          slug
        }
        user {
          id
          name
          slug
          disabled
          deleted
          disabledBy {
            id
            slug
            name
            disabled
            deleted
          }
        }
        comment {
          contentExcerpt
          author {
            id
            name
            slug
            disabled
            deleted
          }
          post {
            id
            disabled
            deleted
            title
            slug
          }
          disabledBy {
            id
            slug
            disabled
            deleted
            name
          }
        }
        post {
          id
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
            id
            slug
            disabled
            deleted
            name
          }
        }
      }
    }
  `)
}
