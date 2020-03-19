import gql from 'graphql-tag'

export const mutedUsers = () => {
  return gql`
    {
      mutedUsers {
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

export const muteUser = () => {
  return gql`
    mutation($id: ID!) {
      muteUser(id: $id) {
        id
        name
        isMuted
        followedByCurrentUser
      }
    }
  `
}

export const unmuteUser = () => {
  return gql`
    mutation($id: ID!) {
      unmuteUser(id: $id) {
        id
        name
        isMuted
        followedByCurrentUser
      }
    }
  `
}
