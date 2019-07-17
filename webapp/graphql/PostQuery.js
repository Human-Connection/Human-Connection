import gql from 'graphql-tag'

export default i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql(`
      query Post($slug: String!) {
        Post(slug: $slug) {
          id
          title
          content
          createdAt
          disabled
          deleted
          slug
          image
          author {
            id
            slug
            name
            avatar
            disabled
            deleted
            shoutedCount
            contributionsCount
            commentsCount
            followedByCount
            followedByCurrentUser
            location {
              name: name${lang}
            }
            badges {
              id
              icon
            }
          }
          tags {
            name
          }
          commentsCount
          comments(orderBy: createdAt_desc) {
            id
            contentExcerpt
            createdAt
            disabled
            deleted
            author {
              id
              slug
              name
              avatar
              disabled
              deleted
              shoutedCount
              contributionsCount
              commentsCount
              followedByCount
              followedByCurrentUser
              location {
                name: name${lang}
              }
              badges {
                id
                icon
              }
            }
          }
          categories {
            id
            name
            icon
          }
          shoutedCount
          shoutedByCurrentUser
        }
      }
    `)
}

export const filterPosts = i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql(`
  query Post($filter: _PostFilter, $first: Int, $offset: Int, $orderBy: [_PostOrdering]) {
    Post(filter: $filter, first: $first, offset: $offset, orderBy: $orderBy) {
      id
      title
      contentExcerpt
      createdAt
      disabled
      deleted
      slug
      image
      author {
        id
        avatar
        slug
        name
        disabled
        deleted
        contributionsCount
        shoutedCount
        commentsCount
        followedByCount
        followedByCurrentUser
        location {
          name: name${lang}
        }
        badges {
          id
          icon
        }
      }
      commentsCount
      categories {
        id
        name
        icon
      }
      shoutedCount
    }
  }
`)
}
