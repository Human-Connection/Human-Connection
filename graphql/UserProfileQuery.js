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
        locationName
        location {
          name: name${lang}
        }
        createdAt
        disabled
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
          categories {
            id
            name
            icon
          }
          author {
            id
            avatar
            name
            location {
              name: name${lang}
            }
          }
        }
      }
    }
  `)
}
