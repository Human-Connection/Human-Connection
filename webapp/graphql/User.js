import gql from 'graphql-tag'
import { postFragment, commentFragment } from './Fragments'

export default i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    query User($id: ID!) {
      User(id: $id) {
        id
        slug
        name
        avatar
        about
        disabled
        deleted
        locationName
        location {
          name: name${lang}
        }
        createdAt
        badges {
          id
          icon
        }
        badgesCount
        shoutedCount
        commentedCount
        contributionsCount
        followingCount
        following(first: 7) {
          id
          slug
          name
          avatar
          disabled
          deleted
          followedByCount
          followedByCurrentUser
          contributionsCount
          commentedCount
          badges {
            id
            icon
          }
          location {
            name: name${lang}
          }
        }
        followedByCount
        followedByCurrentUser
        isBlocked
        followedBy(first: 7)  {
          id
          slug
          name
          disabled
          deleted
          avatar
          followedByCount
          followedByCurrentUser
          contributionsCount
          commentedCount
          badges {
            id
            icon
          }
          location {
            name: name${lang}
          }
        }
        socialMedia {
          id
          url
        }
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
      notifications(read: false, orderBy: createdAt_desc) {
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
