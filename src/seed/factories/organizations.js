import faker from 'faker'
import uuid from 'uuid/v4'

export default function create (params) {
  const {
    id = uuid(),
    name = faker.company.companyName(),
    description = faker.company.catchPhrase(),
    disabled = false,
    deleted = false
  } = params

  return `
    mutation {
      CreateOrganization(
        id: "${id}",
        name: "${name}",
        description: "${description}",
        disabled: ${disabled},
        deleted: ${deleted}
      ) { name }
    }
  `
}
