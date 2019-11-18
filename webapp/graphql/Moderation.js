import gql from 'graphql-tag'

export const reportListQuery = () => {
  // no limit for the moment like before: "reports(first: 20, orderBy: createdAt_desc)"
  return gql`
    query {
      reports(orderBy: createdAt_desc) {
        createdAt
        reasonCategory
        reasonDescription
        caseFolderId
        caseFolderUpdatedAt
        caseFolderDisable
        caseFolderClosed
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
          decidedByModerator {
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
          decidedByModerator {
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
          decidedByModerator {
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

export const decideMutation = () => {
  return gql`
    mutation($resourceId: ID!, $disable: Boolean, $closed: Boolean) {
      decide(resourceId: $resourceId, disable: $disable, closed: $closed) {
        disable
      }
    }
  `
}
