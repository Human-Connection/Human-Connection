import faker from 'faker'

export default function create (params) {
  const {
    description = faker.lorem.sentence(),
    id
  } = params

  return `
    mutation {
      report(
        description: "${description}",
        id: "${id}",
      ) {
        id,
        createdAt
      }
    }
  `
}
