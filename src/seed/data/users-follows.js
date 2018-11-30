export default function (data) {
  return `
    mutation {
      u1_follow_u2: AddUserFollowing(
        from: { id: "u1" },
        to: { id: "u2" }
      ) { from { id } }
      u2_follow_u1: AddUserFollowing(
        from: { id: "u2" },
        to: { id: "u1" }
      ) { from { id } }
      u2_follow_u3: AddUserFollowing(
        from: { id: "u2" },
        to: { id: "u3" }
      ) { from { id } }
      u2_follow_u4: AddUserFollowing(
        from: { id: "u2" },
        to: { id: "u4" }
      ) { from { id } }
      u4_follow_u2: AddUserFollowing(
        from: { id: "u4" },
        to: { id: "u2" }
      ) { from { id } }
    }
  `
}
