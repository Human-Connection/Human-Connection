import gql from 'graphql-tag'

export default app => {
  return {
    CreatePost: gql(`
      mutation($title: String!, $content: String!) {
        CreatePost(title: $title, content: $content) {
          id
          title
          slug
          content
          contentExcerpt
        }
      }
    `),
    UpdatePost: gql(`
      mutation($id: ID!, $title: String!, $content: String!) {
        UpdatePost(id: $id, title: $title, content: $content) {
          id
          title
          slug
          content
          contentExcerpt
        }
      }
    `),
  }
}
