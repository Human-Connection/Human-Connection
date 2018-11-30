export default function (data) {
  return `
    mutation {
      u1_friends_u2: AddUserFriends(
        from: { id: "u1" },
        to: { id: "u2" }
      ) { from { id } }
      u1_friends_u3: AddUserFriends(
        from: { id: "u1" },
        to: { id: "u3" }
      ) { from { id } }
    }
  `
}
