import gql from 'graphql-tag'

export default app => {
  return gql(`
    query {
      Report(first: 20, orderBy: createdAt_desc) {
        id
        description
        type
        createdAt
        reporter {
          name
          slug
        }
        user {
          name
          slug
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
        }
        contribution {
          title
          slug
          author {
            name
            slug
          }
        }
      }
    }
  `)
}
