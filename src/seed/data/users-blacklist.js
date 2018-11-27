export default function (data) {
  return `
    mutation {
      u1_blacklist_u4: AddUserBlacklisted(from: { id: "u1" }, to: { id: "u4" }) { from { id } }
    }
  `
}
