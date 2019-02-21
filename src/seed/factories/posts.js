import faker from 'faker'
import uuid from 'uuid/v4'

export default function (params) {
  const {
    id = uuid(),
    title = faker.lorem.sentence(),
    content = [
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.lorem.sentence()
    ].join('. '),
    image = faker.image.image(),
    visibility = 'public',
    disabled = false,
    deleted = false
  } = params

  return `
    mutation {
      CreatePost(
        id: "${id}",
        title: "${title}",
        content: "${content}",
        image: "${image}",
        visibility: ${visibility},
        disabled: ${disabled},
        deleted: ${deleted}
      ) { title, content }
    }
  `
}

export function relate (type, params) {
  const { from, to } = params
  return `
    mutation {
      ${from}_${type}_${to}: AddPost${type}(
        from: { id: "${from}" },
        to: { id: "${to}" }
      ) { from { id } }
    }
  `
}
