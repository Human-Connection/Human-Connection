import gql from 'graphql-tag'

export const blacklistedUsers = () => {
  return gql`
    {
      blacklistedUsers {
        id
        name
        slug
        avatar
        about
        disabled
        deleted
      }
    }
  `
}

export const blacklistUserContent = () => {
  return gql`
    mutation($id: ID!) {
      blacklistUserContent(id: $id) {
        id
        name
        isBlacklisted
        followedByCurrentUser
      }
    }
  `
}

export const whitelistUserContent = () => {
  return gql`
    mutation($id: ID!) {
      whitelistUserContent(id: $id) {
        id
        name
        isBlacklisted
        followedByCurrentUser
      }
    }
  `
}
