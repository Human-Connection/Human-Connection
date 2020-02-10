import gql from 'graphql-tag'
import {
  userCountsFragment,
  locationAndBadgesFragment,
  userFragment,
  postFragment,
  commentFragment,
} from './Fragments'

export default i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    ${userFragment}
    ${userCountsFragment}
    ${locationAndBadgesFragment(lang)}

    query User($id: ID!) {
      User(id: $id) {
        ...user
        ...userCounts
        ...locationAndBadges
        about
        locationName
        createdAt
        followedByCurrentUser
        isMuted
        isBlocked
        blocked
        following(first: 7) {
          ...user
          ...userCounts
          ...locationAndBadges
        }
        followedBy(first: 7) {
          ...user
          ...userCounts
          ...locationAndBadges
        }
        socialMedia {
          id
          url
        }
        showShoutsPublicly
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
  return gql`
    ${userFragment}
    ${commentFragment}
    ${postFragment}

    query($read: Boolean, $orderBy: NotificationOrdering, $first: Int, $offset: Int) {
      notifications(read: $read, orderBy: $orderBy, first: $first, offset: $offset) {
        id
        read
        reason
        createdAt
        updatedAt
        from {
          __typename
          ... on Post {
            ...post
            author {
              ...user
            }
          }
          ... on Comment {
            ...comment
            author {
              ...user
            }
            post {
              ...post
              author {
                ...user
              }
            }
          }
        }
      }
    }
  `
}

export const markAsReadMutation = i18n => {
  return gql`
    ${userFragment}
    ${commentFragment}
    ${postFragment}

    mutation($id: ID!) {
      markAsRead(id: $id) {
        id
        read
        reason
        createdAt
        updatedAt
        from {
          __typename
          ... on Post {
            ...post
            author {
              ...user
            }
          }
          ... on Comment {
            ...comment
            post {
              ...post
              author {
                ...user
              }
            }
          }
        }
      }
    }
  `
}

export const notificationAdded = () => {
  return gql`
    ${userFragment}
    ${commentFragment}
    ${postFragment}

    subscription notifications($userId: ID!) {
      notificationAdded(userId: $userId) {
        id
        read
        reason
        createdAt
        updatedAt
        from {
          __typename
          ... on Post {
            ...post
            author {
              ...user
            }
          }
          ... on Comment {
            ...comment
            author {
              ...user
            }
            post {
              ...post
              author {
                ...user
              }
            }
          }
        }
      }
    }
  `
}
export const followUserMutation = i18n => {
  return gql`
    ${userFragment}
    ${userCountsFragment}

    mutation($id: ID!) {
      followUser(id: $id) {
        ...user
        ...userCounts
        followedByCount
        followedByCurrentUser
        followedBy(first: 7) {
          ...user
          ...userCounts
        }
      }
    }
  `
}

export const unfollowUserMutation = i18n => {
  return gql`
    ${userFragment}
    ${userCountsFragment}

    mutation($id: ID!) {
      unfollowUser(id: $id) {
        ...user
        ...userCounts
        followedByCount
        followedByCurrentUser
        followedBy(first: 7) {
          ...user
          ...userCounts
        }
      }
    }
  `
}

export const updateUserMutation = () => {
  return gql`
    mutation(
      $id: ID!
      $slug: String
      $name: String
      $locationName: String
      $about: String
      $allowEmbedIframes: Boolean
      $showShoutsPublicly: Boolean
      $termsAndConditionsAgreedVersion: String
      $avatarUpload: Upload
    ) {
      UpdateUser(
        id: $id
        slug: $slug
        name: $name
        locationName: $locationName
        about: $about
        allowEmbedIframes: $allowEmbedIframes
        showShoutsPublicly: $showShoutsPublicly
        termsAndConditionsAgreedVersion: $termsAndConditionsAgreedVersion
        avatarUpload: $avatarUpload
      ) {
        id
        slug
        name
        locationName
        about
        allowEmbedIframes
        showShoutsPublicly
        locale
        termsAndConditionsAgreedVersion
        avatar
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
