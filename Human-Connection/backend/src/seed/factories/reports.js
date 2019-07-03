import faker from 'faker'

export default function create(params) {
  const { description = faker.lorem.sentence(), id } = params

  return {
    mutation: `
      mutation($id: ID!, $description: String!) {
        report(description: $description, id: $id) {
          id
        }
      }
    `,
    variables: {
      id,
      description,
    },
  }
}
