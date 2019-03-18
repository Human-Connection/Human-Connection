import gql from 'graphql-tag'

export default app => {
  const lang = app.$i18n.locale().toUpperCase()
  return gql(`
    query User($slug: String!, $first: Int, $offset: Int) {
      User(slug: $slug) {
        id
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
          name
          slug
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
          name
          disabled
          deleted
          slug
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
        contributions(first: $first, offset: $offset, orderBy: createdAt_desc) {
          id
          slug
          title
          contentExcerpt
          shoutedCount
          commentsCount
          deleted
          image
          createdAt
          disabled
          deleted
          categories {
            id
            name
            icon
          }
          author {
            id
            avatar
            name
            disabled
            deleted
            location {
              name: name${lang}
            }
          }
        }
      }
    }
  `)
}
