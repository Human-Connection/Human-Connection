import faker from 'faker'

export default function create (params) {
  const {
    id = `o${faker.random.number()}`,
    name = faker.comany.companyName(),
    description = faker.company.catchPhrase(),
    disabled = false,
    deleted = false
  } = params

  return `
    mutation {
      ${id}: CreateOrganization(
        id: "${id}",
        name: "${name}",
        description: "${description}",
        disabled: ${disabled},
        deleted: ${deleted}
      ) { name }
    }
  `
}

export function relate(type, params) {
  const { from, to } = params
  return `
    mutation {
      ${from}_${type}_${to}: AddOrganization${type}(
        from: { id: "${from}" },
        to: { id: "${to}" }
      ) { from { id } }
    }
  `
}
