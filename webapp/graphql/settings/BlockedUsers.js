import gql from 'graphql-tag'

export default () => {
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
