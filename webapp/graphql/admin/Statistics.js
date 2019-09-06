import gql from 'graphql-tag'

export const Statistics = gql`
  query {
    statistics {
      countUsers
      countPosts
      countComments
      countNotifications
      countInvites
      countFollows
      countShouts
    }
  }
`
