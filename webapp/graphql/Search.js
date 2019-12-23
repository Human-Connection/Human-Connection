import gql from 'graphql-tag'
import { userFragment, postFragment } from './Fragments'

export const findResourcesQuery = gql`
  ${userFragment}
  ${postFragment}

  query($query: String!) {
    findResources(query: $query, limit: 5) {
      __typename
      ... on Post {
        ...post
        commentsCount
        shoutedCount
        author {
          ...user
        }
      }
      ... on User {
        ...user
      }
    }
  }
`
