import faker from 'faker'

export default function (params) {
  const {
    id = Array.from({ length: 3 }, () => faker.lorem.word()).join(''),
    title = faker.lorem.sentence(),
    content = Array.from({ length: 10 }, () => faker.lorem.sentence()).join(' ')
  } = params
  return `
    mutation {
      ${id}: CreatePost(
        id: "${id}",
        title: "${title}",
        content: "${content}",
        image: "https://picsum.photos/1280/1024?image=424",
        visibility: public,
        disabled: false,
        deleted: false
      ) { title }
    }
  `
}
