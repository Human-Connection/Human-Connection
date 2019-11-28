import gql from 'graphql-tag'

export const reportListQuery = () => {
  // no limit for the moment like before: "reports(first: 20, orderBy: createdAt_desc)"
  return gql`
    query {
      reports(orderBy: createdAt_desc) {
        id
        createdAt
        updatedAt
        disable
        closed
        resource {
          __typename
          ... on User {
            id
            slug
            name
            disabled
            deleted
            followedByCount
            contributionsCount
            commentedCount
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
              followedByCount
              contributionsCount
              commentedCount
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
              followedByCount
              contributionsCount
              commentedCount
            }
          }
        }
        reportsFiled {
          submitter {
            id
            slug
            name
            disabled
            deleted
            followedByCount
            contributionsCount
            commentedCount
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
        type
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
