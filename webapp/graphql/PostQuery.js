import gql from 'graphql-tag'

export default app => {
  const lang = app.$i18n.locale().toUpperCase()
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
          key
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
            key
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
