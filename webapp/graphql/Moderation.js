import gql from 'graphql-tag'

export const reportListQuery = () => {
  return gql`
    query {
      Report(first: 20, orderBy: createdAt_desc) {
        id
        createdAt
        reasonCategory
        reasonDescription
        type
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
        id
      }
    }
  `
}
