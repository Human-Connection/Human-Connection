import gql from 'graphql-tag'

export default app => {
  return {
    CreatePost: gql(`
      mutation($title: String!, $content: String!, $language: String) {
        CreatePost(title: $title, content: $content, language: $language) {
          id
          title
          slug
          content
          contentExcerpt
          language
        }
      }
    `),
    UpdatePost: gql(`
      mutation($id: ID!, $title: String!, $content: String!, $language: String) {
        UpdatePost(id: $id, title: $title, content: $content, language: $language) {
          id
          title
          slug
          content
          contentExcerpt
          language
        }
      }
    `),
  }
}
