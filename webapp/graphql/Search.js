import gql from 'graphql-tag'
import { userFragment, postFragment, tagsCategoriesAndPinnedFragment } from './Fragments'

export const searchQuery = gql`
  ${userFragment}
  ${postFragment}
  ${tagsCategoriesAndPinnedFragment}

  query($query: String!, $firstPosts: Int, $firstUsers: Int, $offset: Int) {
    searchResults(
      query: $query
      firstPosts: $firstPosts
      firstUsers: $firstUsers
      offset: $offset
    ) {
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

export const searchPosts = gql`
  ${userFragment}
  ${postFragment}
  ${tagsCategoriesAndPinnedFragment}

  query($query: String!, $firstPosts: Int, $postsOffset: Int) {
    searchPosts(query: $query, firstPosts: $firstPosts, postsOffset: $postsOffset) {
      __typename
      ...post
      ...tagsCategoriesAndPinned
      commentsCount
      shoutedCount
      author {
        ...user
      }
    }
  }
`

export const searchUsers = gql`
  ${userFragment}

  query($query: String!, $firstUsers: Int, $usersOffset: Int) {
    searchUsers(query: $query, firstUsers: $firstUsers, usersOffset: $usersOffset) {
      __typename
      ...user
    }
  }
`
