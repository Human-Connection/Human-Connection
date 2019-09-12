import gql from 'graphql-tag'

export default i18n => {
  const lang = i18n.locale().toUpperCase()
  return {
    CreateComment: gql`
      mutation($postId: ID!, $content: String!) {
        CreateComment(postId: $postId, content: $content) {
          id
          contentExcerpt
          content
          createdAt {
            formatted
          }
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
            badges {
              id
              icon
            }
          }
        }
      }
    `,
    UpdateComment: gql`
      mutation($content: String!, $id: ID!) {
        UpdateComment(content: $content, id: $id) {
          id
          contentExcerpt
          content
          createdAt {
            formatted
          }
          disabled
          deleted
          author {
            id
            slug
            name
            avatar
            disabled
            deleted
          }
        }
      }
    `,
    DeleteComment: gql`
      mutation($id: ID!) {
        DeleteComment(id: $id) {
          id
          contentExcerpt
          content
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
      }
    `,
  }
}
