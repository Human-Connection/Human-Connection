import gql from 'graphql-tag'

export const BlockedUsers = () => {
  return gql(`
    {
      blockedUsers {
        id
        name
        slug
        avatar
        about
        disabled
        deleted
      }
    }
  `)
}

export const Block = () => {
  return gql(`mutation($id:ID!) {
    block(id: $id) {
      id
      name
      isBlocked
      followedByCurrentUser
    }
  }`)
}

export const Unblock = () => {
  return gql(`mutation($id:ID!) {
    unblock(id: $id) {
      id
      name
      isBlocked
      followedByCurrentUser
    }
  }`)
}
