import faker from 'faker'

export default function create (params) {
  const {
    description = faker.lorem.sentence(),
    resource: { id: resourceId, type }
  } = params

  return `
    mutation {
      report(
        description: "${description}",
        resource: {
          id: "${resourceId}",
          type: ${type}
        }
      ) {
        id,
        createdAt
      }
    }
  `
}
