import gql from 'graphql-tag'

export default app => {
  const lang = app.$i18n.locale().toUpperCase()
  return gql(`
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
          key
          icon
        }
        badgesCount
        shoutedCount
        commentsCount
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
          commentsCount
          badges {
            id
            key
            icon
          }
          location {
            name: name${lang}
          }
        }
        followedByCount
        followedByCurrentUser
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
          commentsCount
          badges {
            id
            key
            icon
          }
          location {
            name: name${lang}
          }
        }
        contributionsCount
        socialMedia {
          id
          url
        }
      }
    }
  `)
}
