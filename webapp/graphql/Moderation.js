import gql from 'graphql-tag'

export const reportListQuery = () => {
  // no limit for the moment like before: "reports(first: 20, orderBy: createdAt_desc)"
  return gql`
    query {
      reports(orderBy: createdAt_desc) {
        createdAt
        reasonCategory
        reasonDescription
        claimId
        claimUpdatedAt
        claimDisable
        claimClosed
        type
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
        user {
          id
          slug
          name
          disabled
          deleted
          reviewedByModerator {
            id
            slug
            name
            disabled
            deleted
          }
          followedByCount
          contributionsCount
          commentedCount
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
          reviewedByModerator {
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
            followedByCount
            contributionsCount
            commentedCount
          }
          reviewedByModerator {
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
    mutation($resourceId: ID!, $reasonCategory: ReasonCategory!, $reasonDescription: String!) {
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

export const reviewMutation = () => {
  return gql`
    mutation($resourceId: ID!, $disable: Boolean, $closed: Boolean) {
      review(resourceId: $resourceId, disable: $disable, closed: $closed) {
        disable
      }
    }
  `
}
