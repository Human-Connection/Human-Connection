import faker from 'faker'
import uuid from 'uuid/v4'

export default function create(params) {
  const {
    id = uuid(),
    name = faker.company.companyName(),
    description = faker.company.catchPhrase(),
  } = params

  return {
    mutation: `
      mutation($id: ID!, $name: String!, $description: String!) {
        CreateOrganization(id: $id, name: $name, description: $description) {
          name
        }
      }
    `,
    variables: { id, name, description },
  }
}
