export default function (data) {
  return `
    mutation {
      r1: CreateReport(id: "r1", type: contribution, description: "Bad Stuff") {
        id
      }
      r2: CreateReport(id: "r2", type: comment, description: "Please remove this sh**") {
        id
      }
      r3: CreateReport(id: "r3", type: user, description: "The user have misbehaved!") {
        id
      }
      ra1: AddReportReporter(from: { id: "u1" }, to: { id: "r1" }) {
        from {
          id
        }
      }
      ra2: AddReportReporter(from: { id: "u2" }, to: { id: "r2" }) {
        from {
          id
        }
      }
      ra3: AddReportReporter(from: { id: "u3" }, to: { id: "r3" }) {
        from {
          id
        }
      }
      rc1: AddReportContribution(from: { id: "r1" }, to: { id: "p2" }) {
        from {
          id
        }
      }
      rc2: AddReportComment(from: { id: "r2" }, to: { id: "c2" }) {
        from {
          id
        }
      }
      rc3: AddReportUser(from: { id: "r3" }, to: { id: "u4" }) {
        from {
          id
        }
      }
    }
  `
}
