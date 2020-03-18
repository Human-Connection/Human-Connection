import gql from 'graphql-tag'
import { userFragment, postFragment, tagsCategoriesAndPinnedFragment } from './Fragments'

export const searchQuery = gql`
  ${userFragment}
  ${postFragment}
  ${tagsCategoriesAndPinnedFragment}

  query($query: String!, $limit: Int = 5) {
    searchResults(query: $query, limit: $limit) {
      __typename
      ... on Post {
        ...post
        ...tagsCategoriesAndPinned
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
