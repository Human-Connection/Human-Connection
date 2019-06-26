import gql from 'graphql-tag'

export default () => {
  return {
    CreatePost: gql`
      mutation($title: String!, $content: String!, $language: String, $categories: [ID]) {
        CreatePost(title: $title, content: $content, language: $language, categories: $categories) {
          id
          title
          slug
          content
          contentExcerpt
          language
          categories {
            name
          }
        }
      }
    `,
    UpdatePost: gql`
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
    `,
    DeletePost: gql`
      mutation($id: ID!) {
        DeletePost(id: $id) {
          id
        }
      }
    `,
  }
}
