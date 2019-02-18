
import faker from 'faker'

export default function (params) {
  const {
    id = `u${faker.random.number()}`,
    title = faker.lorem.sentence(),
    content = [
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.lorem.sentence(),
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
      ) { id, title }
    }
  `
}
