import gql from 'graphql-tag'
import { userFragment, postFragment, commentFragment } from './Fragments'

export default i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${userFragment(lang)}

    query User($id: ID!) {
      User(id: $id) {
        ...user
        about
        locationName
        createdAt
        badgesCount
        followingCount
        following(first: 7) {
          ...user
        }
        followedByCount
        followedByCurrentUser
        isBlocked
        followedBy(first: 7) {
          ...user
        }
        socialMedia {
          id
          url
        }
      }
    }
  `
}

export const minimisedUserQuery = () => {
  return gql`
    query {
      User(orderBy: slug_asc) {
        id
        slug
        name
        avatar
      }
    }
  `
}

export const notificationQuery = i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${commentFragment(lang)}
    ${postFragment(lang)}

    query {
      notifications(read: false, orderBy: updatedAt_desc) {
        read
        reason
        createdAt
        from {
          __typename
          ... on Post {
            ...post
          }
          ... on Comment {
            ...comment
            post {
              ...post
            }
          }
        }
      }
    }
  `
}

export const markAsReadMutation = i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${commentFragment(lang)}
    ${postFragment(lang)}

    mutation($id: ID!) {
      markAsRead(id: $id) {
        read
        reason
        createdAt
        from {
          __typename
          ... on Post {
            ...post
          }
          ... on Comment {
            ...comment
            post {
              ...post
            }
          }
        }
      }
    }
  `
}

export const followUserMutation = i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${userFragment(lang)}
    mutation($id: ID!) {
      followUser(id: $id) {
        name
        followedByCount
        followedByCurrentUser
        followedBy(first: 7) {
          ...user
        }
      }
    }
  `
}

export const unfollowUserMutation = i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${userFragment(lang)}
    mutation($id: ID!) {
      unfollowUser(id: $id) {
        name
        followedByCount
        followedByCurrentUser
        followedBy(first: 7) {
          ...user
        }
      }
    }
  `
}

export const allowEmbedIframesMutation = () => {
  return gql`
    mutation($id: ID!, $allowEmbedIframes: Boolean) {
      UpdateUser(id: $id, allowEmbedIframes: $allowEmbedIframes) {
        id
        allowEmbedIframes
      }
    }
  `
}

export const checkSlugAvailableQuery = gql`
  query($slug: String!) {
    User(slug: $slug) {
      slug
    }
  }
`
