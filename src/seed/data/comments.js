import faker from 'faker'

/**
 * TODO: add a comment automatically to the correct post and relate it to the current user
 */
export default function (data) {
  return `
    mutation {
      c1: CreateComment(
        id: "c1",
        content: "<p>da stimm ich dir zu. Mir ging das auch nie in den kopf, und hatte jesus nie als gott gesehen </p>"
      ) { id }
      c1_u1: AddCommentAuthor(from: { id: "u3" }, to: { id: "c1" }) { from { id } }
      c1_p1: AddCommentPost(
        from: { id: "c1" },
        to: { id: "p1" }
      ) { from { id } }

      c2: CreateComment(
        id: "c2",
        content: "<p>Schön das es dich gibt ❤️❤️❤️❤️❤️❤️❤️❤️❤️</p>"
      ) { id }
      c2_u1: AddCommentAuthor(from: { id: "u1" }, to: { id: "c2" }) { from { id } }
      c2_p1: AddCommentPost(
        from: { id: "c2" },
        to: { id: "p1" }
      ) { from { id } }

      c3: CreateComment(
        id: "c3",
        content: "<p>Hi Dieter,</p><p>danke für Deine Info. Hast Du mal ein Foto von Deinem Cabrio mit dem Logo drauf?</p>"
      ) { id }
      c3_u2: AddCommentAuthor(from: { id: "u1" }, to: { id: "c3" }) { from { id } }
      c3_p3: AddCommentPost(
        from: { id: "c3" },
        to: { id: "p3" }
      ) { from { id } }

      c4: CreateComment(
        id: "c4",
        content: "<p>Das Zusammenführen aller Gruppen, die mit uns am gleichen Strang in die gleiche Richtung ziehen, in eine gemeinsame Adressenstruktur sehe ich auch als Haupt - Aufgabe für unsere neue Netzwerkbildung an.</p>"
      ) { id }
      c4_u3: AddCommentAuthor(from: { id: "u4" }, to: { id: "c4" }) { from { id } }
      c4_p2: AddCommentPost(
        from: { id: "c4" },
        to: { id: "p2" }
      ) { from { id } }

      c5: CreateComment(
        id: "c5",
        content: "${faker.lorem.paragraph()}"
      ) { id }
      c5_u4: AddCommentAuthor(from: { id: "u4" }, to: { id: "c5" }) { from { id } }
      c5_p3: AddCommentPost(
        from: { id: "c5" },
        to: { id: "p3" }
      ) { from { id } }

      c6: CreateComment(
        id: "c6",
        content: "${faker.lorem.paragraph()}"
      ) { id }
      c6_u3: AddCommentAuthor(from: { id: "u3" }, to: { id: "c6" }) { from { id } }
      c6_p4: AddCommentPost(
        from: { id: "c6" },
        to: { id: "p4" }
      ) { from { id } }

      c7: CreateComment(
        id: "c7",
        content: "${faker.lorem.paragraph()}"
      ) { id }
      c7_u2: AddCommentAuthor(from: { id: "u2" }, to: { id: "c7" }) { from { id } }
      c7_p2: AddCommentPost(
        from: { id: "c7" },
        to: { id: "p2" }
      ) { from { id } }
    }
  `
}
