import faker from 'faker'

export default function (data) {
  return `
    mutation {
      u1: CreateUser(
        id: "u1",
        name: "Peter Lustig",
        password: "1234",
        email: "admin@example.org",
        avatar: "${faker.internet.avatar()}",
        role: admin,
        disabled: false,
        deleted: false) {
        id
        name
        email
        avatar
        role
      }
      u2: CreateUser(
        id: "u2",
        name: "Bob der Bausmeister",
        password: "1234",
        email: "moderator@example.org",
        avatar: "${faker.internet.avatar()}",
        role: moderator,
        disabled: false,
        deleted: false) {
        id
        name
        email
        avatar
        role
      }
      u3: CreateUser(
        id: "u3",
        name: "Jenny Rostock",
        password: "1234",
        email: "user@example.org",
        avatar: "${faker.internet.avatar()}",
        role: user,
        disabled: false,
        deleted: false) {
        id
        name
        email
        avatar
        role
      }
      u4: CreateUser(
        id: "u4",
        name: "Angie Banjie",
        password: "1234",
        email: "angie@example.org",
        avatar: "${faker.internet.avatar()}",
        role: user,
        disabled: false,
        deleted: false) {
        id
        name
        email
        avatar
        role
      }
    }
  `
}
