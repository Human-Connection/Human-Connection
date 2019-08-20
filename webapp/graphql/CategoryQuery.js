import gql from 'graphql-tag'

export default () => {
  return gql(`{
    Category {
      id
      slug
      icon
    }
  }`)
}
