import gql from 'graphql-tag'

export default () => {
  return {
    CreateOrganization: gql`
      mutation(
        $name: String!
        $description: String
        $locationName: String
        $categoryIds: [ID]
        $image: ImageInput
      ) {
        CreateOrganization(
          name: $name
          description: $description
          locationName: $locationName
          categoryIds: $categoryIds
          image: $image
        ) {
          name
          slug
          description
          locationName
          image {
            url
            sensitive
          }
        }
      }
    `,
  }
}
