export default function (data) {
  return `
    mutation {
      t1: CreateTag(
        id: "t1",
        name: "Umwelt"
      ) { name }
      t2: CreateTag(
        id: "t2",
        name: "Naturschutz"
      ) { name }
      t3: CreateTag(
        id: "t3",
        name: "Demokratie"
      ) { name }
      t4: CreateTag(
        id: "t4",
        name: "Freiheit"
      ) { name }
    }
  `
}
