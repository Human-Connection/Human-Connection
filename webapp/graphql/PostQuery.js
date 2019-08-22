import gql from 'graphql-tag'

export default i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
    query Post($id: ID!) {
      Post(id: $id) {
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
          commentedCount
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
          id
        }
        comments(orderBy: createdAt_asc) {
          id
          contentExcerpt
          content
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
            commentedCount
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
        emotionsCount
      }
    }
  `
}

export const filterPosts = i18n => {
  const lang = i18n.locale().toUpperCase()
  return gql`
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
        commentedCount
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
      categories {
        id
        name
        icon
      }
      shoutedCount
    }
  }
`
}

export const PostsEmotionsByCurrentUser = () => {
  return gql`
    query PostsEmotionsByCurrentUser($postId: ID!) {
      PostsEmotionsByCurrentUser(postId: $postId)
    }
  `
}
