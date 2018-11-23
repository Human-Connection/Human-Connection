export default function (data) {
  return `
    mutation {
      u1s2: AddUserShouted(
        from: { id: "u1" },
        to: { id: "p2" }
      ) { from { id } }
      u1s3: AddUserShouted(
        from: { id: "u1" },
        to: { id: "p3" }
      ) { from { id } }
      u2s1: AddUserShouted(
        from: { id: "u2" },
        to: { id: "p1" }
      ) { from { id } }
      u3s1: AddUserShouted(
        from: { id: "u3" },
        to: { id: "p1" }
      ) { from { id } }
      u3s4: AddUserShouted(
        from: { id: "u3" },
        to: { id: "p4" }
      ) { from { id } }
      u4s1: AddUserShouted(
        from: { id: "u4" },
        to: { id: "p1" }
      ) { from { id } }
    }
  `
}
