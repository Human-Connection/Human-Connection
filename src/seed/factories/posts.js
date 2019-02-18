
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
    deleted = false,
    tagIds = [],
    categoryIds = []
  } = params

  const categoryRelations = categoryIds.map((categoryId) => {
    return `${id}_${categoryId}: AddPostCategories(
      from: {id: "${id}"},
      to: {id: "${categoryId}"}
    ) { from { id } }`
  })

  return `
    mutation {
      ${id}: CreatePost(
        id: "${id}",
        title: "${title}",
        content: "${content}",
        image: "${image}",
        visibility: ${visibility},
        disabled: ${disabled},
        deleted: ${deleted}
      ) { id, title }
      ${categoryRelations.join('\n')}
    }
  `
}
