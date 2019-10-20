import gql from 'graphql-tag'

export default () => {
  return gql`
    query {
      Category {
        id
        slug
        icon
      }
    }
  `
}
