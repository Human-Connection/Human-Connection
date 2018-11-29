export default function (data) {
  return `
    mutation {
      b1_u1: AddUserBadges(from: {id: "b1"}, to: {id: "u1"}) { from { id } }
      b2_u1: AddUserBadges(from: {id: "b2"}, to: {id: "u1"}) { from { id } }
      b3_u1: AddUserBadges(from: {id: "b3"}, to: {id: "u1"}) { from { id } }
      b6_u2: AddUserBadges(from: {id: "b6"}, to: {id: "u2"}) { from { id } }
      b3_u3: AddUserBadges(from: {id: "b3"}, to: {id: "u3"}) { from { id } }
      b5_u4: AddUserBadges(from: {id: "b5"}, to: {id: "u4"}) { from { id } }
    }
  `
}
