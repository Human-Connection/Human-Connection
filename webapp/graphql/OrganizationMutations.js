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
        $email: String
      ) {
        CreateOrganization(
          name: $name
          description: $description
          locationName: $locationName
          categoryIds: $categoryIds
          image: $image
          email: $email
        ) {
          name
          slug
          description
          locationName
          email
          image {
            url
            sensitive
          }
        }
      }
    `,
    UpdateOrganization: gql`
      mutation(
        $id: ID!
        $name: String!
        $description: String
        $locationName: String
        $categoryIds: [ID]
        $image: ImageInput
        $email: String
      ) {
        UpdateOrganization(
          id: $id
          name: $name
          description: $description
          locationName: $locationName
          categoryIds: $categoryIds
          image: $image
          email: $email
        ) {
          name
          slug
          description
          locationName
          email
          image {
            url
            sensitive
          }
        }
      }
    `,
  }
}
