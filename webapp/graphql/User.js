import gql from 'graphql-tag'

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

export const currentUserNotificationsQuery = () => {
  return gql`
    query {
      currentUser {
        id
        notifications(read: false, orderBy: createdAt_desc) {
          id
          read
          reason
          createdAt
          post {
            id
            createdAt
            disabled
            deleted
            title
            contentExcerpt
            slug
            author {
              id
              slug
              name
              disabled
              deleted
              avatar
            }
          }
          comment {
            id
            createdAt
            disabled
            deleted
            contentExcerpt
            author {
              id
              slug
              name
              disabled
              deleted
              avatar
            }
            post {
              id
              createdAt
              disabled
              deleted
              title
              contentExcerpt
              slug
              author {
                id
                slug
                name
                disabled
                deleted
                avatar
              }
            }
          }
        }
      }
    }
  `
}

export const updateNotificationMutation = () => {
  return gql`
    mutation($id: ID!, $read: Boolean!) {
      UpdateNotification(id: $id, read: $read) {
        id
        read
      }
    }
  `
}
