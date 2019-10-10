import gql from 'graphql-tag'

export const reportListQuery = () => {
  // no limit vor the moment like before: "Report(first: 20, orderBy: createdAt_desc)"
  return gql`
    query {
      Report(orderBy: createdAt_desc) {
        createdAt
        reasonCategory
        reasonDescription
        type
        resourceId
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
          id
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
  `
}

export const reportMutation = () => {
  return gql`
    mutation($resourceId: ID!, $reasonCategory: String!, $reasonDescription: String!) {
      report(
        resourceId: $resourceId
        reasonCategory: $reasonCategory
        reasonDescription: $reasonDescription
      ) {
        type
      }
    }
  `
}
