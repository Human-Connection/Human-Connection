import faker from 'faker'

export default {
  User: () => ({
    name: () => `${faker.name.firstName()} ${faker.name.lastName()}`,
    email: () => `${faker.internet.email()}`,
  }),
  Post: () => ({
    title: () => faker.lorem.lines(1),
    slug: () => faker.lorem.slug(3),
    content: () => faker.lorem.paragraphs(5),
    contentExcerpt: () => faker.lorem.paragraphs(1),
  }),
}
