import faker from 'faker'

export default function (params) {
  const {
    id = `c${faker.random.number()}`,
    content = [
      faker.lorem.sentence(),
      faker.lorem.sentence()
    ].join('. '),
    disabled = false,
    deleted = false
  } = params

  return `
    mutation {
      ${id}: CreateComment(
        id: "${id}",
        content: "${content}",
        disabled: ${disabled},
        deleted: ${deleted}
      ) { id }
    }
  `
}

export function relate (type, params) {
  const { from, to } = params
  return `
    mutation {
      ${from}_${type}_${to}: AddComment${type}(
        from: { id: "${from}" },
        to: { id: "${to}" }
      ) { from { id } }
    }
  `
}
