import gql from 'graphql-tag'

export const findResourcesQuery = gql`
  query($query: String!) {
    findResources(query: $query, limit: 5) {
      __typename
      ... on Post {
        id
        title
        slug
        commentsCount
        shoutedCount
        createdAt
        author {
          id
          name
        }
      }
      ... on User {
        id
        name
        slug
        avatar
      }
    }
  }
`
