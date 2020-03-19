import gql from 'graphql-tag'

export const blockedUsers = () => {
  return gql`
    {
      blockedUsers {
        id
        name
        slug
        avatar {
          url
        }
        about
        disabled
        deleted
      }
    }
  `
}

export const blockUser = () => {
  return gql`
    mutation($id: ID!) {
      blockUser(id: $id) {
        id
        name
        blocked
        followedByCurrentUser
      }
    }
  `
}

export const unblockUser = () => {
  return gql`
    mutation($id: ID!) {
      unblockUser(id: $id) {
        id
        name
        blocked
        followedByCurrentUser
      }
    }
  `
}
