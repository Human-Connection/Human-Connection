import gql from 'graphql-tag'

export const reportsListQuery = () => {
  // no limit for the moment like before: "reports(first: 20, orderBy: createdAt_desc)"
  return gql`
    query(
      $orderBy: ReportOrdering
      $first: Int
      $offset: Int
      $reviewed: Boolean
      $closed: Boolean
    ) {
      reports(
        orderBy: $orderBy
        first: $first
        offset: $offset
        reviewed: $reviewed
        closed: $closed
      ) {
        id
        createdAt
        updatedAt
        closed
        reviewed {
          createdAt
          updatedAt
          disable
          moderator {
            id
            slug
            name
          }
        }
        resource {
          __typename
          ... on User {
            id
            slug
            name
            disabled
            deleted
          }
          ... on Comment {
            id
            contentExcerpt
            disabled
            deleted
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
          }
          ... on Post {
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
          }
        }
        filed {
          submitter {
            id
            slug
            name
            disabled
            deleted
          }
          createdAt
          reasonCategory
          reasonDescription
        }
      }
    }
  `
}

export const reportMutation = () => {
  return gql`
    mutation($resourceId: ID!, $reasonCategory: ReasonCategory!, $reasonDescription: String!) {
      fileReport(
        resourceId: $resourceId
        reasonCategory: $reasonCategory
        reasonDescription: $reasonDescription
      ) {
        id
      }
    }
  `
}

export const reviewMutation = () => {
  return gql`
    mutation($resourceId: ID!, $disable: Boolean, $closed: Boolean) {
      review(resourceId: $resourceId, disable: $disable, closed: $closed) {
        disable
      }
    }
  `
}
