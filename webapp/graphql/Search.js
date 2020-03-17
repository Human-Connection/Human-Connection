import gql from 'graphql-tag'
import { userFragment, postFragment } from './Fragments'

export const findResourcesQuery = gql`
  ${userFragment}
  ${postFragment}

  query($query: String!, $limit: Int = 5, $filter: _PostFilter = {}) {
    findResources(query: $query, limit: $limit, filter: $filter) {
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
