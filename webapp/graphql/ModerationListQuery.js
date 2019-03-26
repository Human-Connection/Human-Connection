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
          slug
          name
          disabled
          deleted
        }
        user {
          id
          slug
          name
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
            slug
            name
            disabled
            deleted
          }
          post {
            id
            slug
            title
            disabled
            deleted
          }
          disabledBy {
            id
            slug
            name
            disabled
            deleted
          }
        }
        post {
          id
          slug
          title
          disabled
          deleted
          author {
            id
            slug
            name
            disabled
            deleted
          }
          disabledBy {
            id
            slug
            name
            disabled
            deleted
          }
        }
      }
    }
  `)
}
