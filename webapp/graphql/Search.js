import gql from 'graphql-tag'
import { userFragment, postFragment } from './Fragments'

export const searchQuery = gql`
  ${userFragment}
  ${postFragment}

  query($query: String!) {
    searchResults(query: $query, limit: 5) {
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
      ... on Tag {
        id
      }
    }
  }
`

export const searchPosts = gql`
  ${userFragment}
  ${postFragment}

  query($query: String!, $firstPosts: Int, $postsOffset: Int) {
    searchPosts(query: $query, firstPosts: $firstPosts, postsOffset: $postsOffset) {
      postCount
      posts {
        __typename
        ...post
        commentsCount
        shoutedCount
        author {
          ...user
        }
      }
    }
  }
`

export const searchUsers = gql`
  ${userFragment}

  query($query: String!, $firstUsers: Int, $usersOffset: Int) {
    searchUsers(query: $query, firstUsers: $firstUsers, usersOffset: $usersOffset) {
      userCount
      users {
        __typename
        ...user
      }
    }
  }
`

export const searchHashtags = gql`
  query($query: String!, $firstHashtags: Int, $hashtagsOffset: Int) {
    searchHashtags(query: $query, firstHashtags: $firstHashtags, hashtagsOffset: $hashtagsOffset) {
      hashtagCount
      hashtags {
        __typename
        id
      }
    }
  }
`
