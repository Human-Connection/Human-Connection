import gql from 'graphql-tag'

export default () => {
  return {
    CreatePost: gql`
      mutation(
        $title: String!
        $content: String!
        $language: String
        $categoryIds: [ID]
        $image: ImageInput
      ) {
        CreatePost(
          title: $title
          content: $content
          language: $language
          categoryIds: $categoryIds
          image: $image
        ) {
          title
          slug
          content
          contentExcerpt
          language
          image {
            url
            sensitive
          }
        }
      }
    `,
    UpdatePost: gql`
      mutation(
        $id: ID!
        $title: String!
        $content: String!
        $language: String
        $image: ImageInput
        $categoryIds: [ID]
      ) {
        UpdatePost(
          id: $id
          title: $title
          content: $content
          language: $language
          image: $image
          categoryIds: $categoryIds
        ) {
          id
          title
          slug
          content
          contentExcerpt
          language
          image {
            url
            sensitive
            aspectRatio
          }
          pinnedBy {
            id
            name
            role
          }
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
    AddPostEmotionsMutation: gql`
      mutation($to: _PostInput!, $data: _EMOTEDInput!) {
        AddPostEmotions(to: $to, data: $data) {
          emotion
          from {
            id
          }
          to {
            id
          }
        }
      }
    `,
    RemovePostEmotionsMutation: gql`
      mutation($to: _PostInput!, $data: _EMOTEDInput!) {
        RemovePostEmotions(to: $to, data: $data) {
          emotion
          from {
            id
          }
          to {
            id
          }
        }
      }
    `,
    pinPost: gql`
      mutation($id: ID!) {
        pinPost(id: $id) {
          id
          title
          slug
          content
          contentExcerpt
          language
          pinnedBy {
            id
            name
            role
          }
        }
      }
    `,
    unpinPost: gql`
      mutation($id: ID!) {
        unpinPost(id: $id) {
          id
          title
          slug
          content
          contentExcerpt
          language
          pinnedBy {
            id
            name
            role
          }
        }
      }
    `,
  }
}
