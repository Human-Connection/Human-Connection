import gql from 'graphql-tag'

export const findResourcesQuery = gql`
  query($query: String!) {
    findResources(query: $query, limit: 5) {
      id
      searchResults {
        __typename
        ... on Post {
          id
          title
          slug
          commentsCount
          shoutedCount
          createdAt
          author {
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
  }
`
