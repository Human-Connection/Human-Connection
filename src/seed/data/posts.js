import faker from 'faker'

export default function (data) {
  return `
    mutation {
      p1: CreatePost(
        id: "p1",
        title: "Gedanken eines Polizisten zum Einsatz im Hambacher Forst",
        content: "<p><strong>Diese Zukunftsstadt ist real und keine Computer-Animation</strong> – sondern sie ist das Lebenswerk des mittlerweile über 100 Jahre alten Futuristen und Architekten Jacque Fresco aus Florida. In 35 Jahren (seit seinem 13. Lebensjahr) hat dieser zusammen mit seiner Frau seinen futuristischen Traum von einer besonderen Zukunftsstadt auf 85.000 Quadratmetern realisiert. In den Gebäuden und Gärten befinden sich u.a. ein Forschungszentrum, Vortragsräume und unzählige seiner Modelle &amp; Architekturentwürfe.</p><br /><p>Sein zentrales Anliegen ist eine resourcenbasierte Wirtschaft und die Abschaffung von Geld und Privatbesitz. Mit Hilfe von Roboterarbeit und dem Bedingungslosen Grundeinkommen (da nach seiner Ansicht in den kommenden Jahren fast alle Jobs automatisiert werden), möchte er eine ökologische Landwirtschaft mit Permakulturen etc. und eine effiziente Energiegewinnung (ausschließlich durch regenerative Energien) schaffen. Wenige kompatible Formen in einer sparsamen Modulbauweise (in die u.a. bereits variable Service- und Reparaturelemente integriert sind) sollen insgesamt eine soziale &amp; ökologische Utopie im Einklang mit der Natur ermöglichen.</p><br /><p>Nachfolgend der Direkt-Link auf den interessanten Artikel von Zoltan Istvan, der den Architekten und seine Frau in Florida besuchen durfte und seinen Artikel Ende 2016 auf „MOTHERBOARD“ veröffentlicht hatte:</p><br /><p>https://motherboard.vice.com/de/article/vv34nb/ich-habe-die-zukunft-besucht-in-der-wir-ohne-geld-steuern-und-besitz-leben </p><br /><p>Da soll noch jemand behaupten, es gäbe keine Utopien mehr bzw. keine Futuristen, die ihre kreativen und zukunftsfähigen Ideen (auch in ganz großem Stil) selbst in die Tat umsetzen. LG @all :) </p><br /><p><strong>Wir sind eine Menschheitsfamilie. • Wir sind eins. • Wir sind HUMAN CONNECTION</strong> ❤️</p>",
        image: "https://picsum.photos/1280/1024?image=352",
        visibility: public,
        disabled: false,
        deleted: false
      ) { title }
      p1_cat1: AddPostCategories(from: {id: "p1"}, to: {id: "cat1"}) { from { id } }
      p1_cat2: AddPostCategories(from: {id: "p1"}, to: {id: "cat2"}) { from { id } }
      ur1: AddUserContributions(from: { id: "u1" }, to: { id: "p1" }) { from { id } }
      p1_t1: AddPostTags(
        from: { id: "p1" }
        to: { id: "t1" }
      ) { from { id } }
      p1_t2: AddPostTags(
        from: { id: "p1" }
        to: { id: "t2" }
      ) { from { id } }
      p1_t3: AddPostTags(
        from: { id: "p1" }
        to: { id: "t3" }
      ) { from { id } }

      p2: CreatePost(
        id: "p2",
        title: "Julian Assange",
        content: "<p><strong>Diese Zukunftsstadt ist real und keine Computer-Animation</strong> – sondern sie ist das Lebenswerk des mittlerweile über 100 Jahre alten Futuristen und Architekten Jacque Fresco aus Florida. In 35 Jahren (seit seinem 13. Lebensjahr) hat dieser zusammen mit seiner Frau seinen futuristischen Traum von einer besonderen Zukunftsstadt auf 85.000 Quadratmetern realisiert. In den Gebäuden und Gärten befinden sich u.a. ein Forschungszentrum, Vortragsräume und unzählige seiner Modelle &amp; Architekturentwürfe.</p><br /><p>Sein zentrales Anliegen ist eine resourcenbasierte Wirtschaft und die Abschaffung von Geld und Privatbesitz. Mit Hilfe von Roboterarbeit und dem Bedingungslosen Grundeinkommen (da nach seiner Ansicht in den kommenden Jahren fast alle Jobs automatisiert werden), möchte er eine ökologische Landwirtschaft mit Permakulturen etc. und eine effiziente Energiegewinnung (ausschließlich durch regenerative Energien) schaffen. Wenige kompatible Formen in einer sparsamen Modulbauweise (in die u.a. bereits variable Service- und Reparaturelemente integriert sind) sollen insgesamt eine soziale &amp; ökologische Utopie im Einklang mit der Natur ermöglichen.</p><br /><p>Nachfolgend der Direkt-Link auf den interessanten Artikel von Zoltan Istvan, der den Architekten und seine Frau in Florida besuchen durfte und seinen Artikel Ende 2016 auf „MOTHERBOARD“ veröffentlicht hatte:</p><br /><p>https://motherboard.vice.com/de/article/vv34nb/ich-habe-die-zukunft-besucht-in-der-wir-ohne-geld-steuern-und-besitz-leben </p><br /><p>Da soll noch jemand behaupten, es gäbe keine Utopien mehr bzw. keine Futuristen, die ihre kreativen und zukunftsfähigen Ideen (auch in ganz großem Stil) selbst in die Tat umsetzen. LG @all :) </p><br /><p><strong>Wir sind eine Menschheitsfamilie. • Wir sind eins. • Wir sind HUMAN CONNECTION</strong> ❤️</p>",
        image: "https://picsum.photos/1280/1024?image=72",
        visibility: public,
        disabled: false,
        deleted: false
      ) { title }
      p2_cat1: AddPostCategories(from: {id: "p2"}, to: {id: "cat1"}) { from { id } }
      p2_cat16: AddPostCategories(from: {id: "p2"}, to: {id: "cat16"}) { from { id } }
      ur2: AddUserContributions(from: { id: "u2" }, to: { id: "p2" }) { from { id } }
      p2_t4: AddPostTags(
        from: { id: "p2" }
        to: { id: "t4" }
      ) { from { id } }

      p3: CreatePost(
        id: "p3",
        title: "Hacker, Freaks und Funktionäre...Der CCC",
        content: "${faker.lorem.sentence()} ${faker.lorem.sentence()} ${faker.lorem.sentence()} ${faker.lorem.sentence()} ${faker.lorem.sentence()}",
        image: "https://picsum.photos/1280/1024?image=121",
        visibility: public,
        disabled: false,
        deleted: false
      ) { title }
      p3_cat1: AddPostCategories(from: {id: "p3"}, to: {id: "cat1"}) { from { id } }
      p3_cat3: AddPostCategories(from: {id: "p3"}, to: {id: "cat3"}) { from { id } }
      p3_cat14: AddPostCategories(from: {id: "p3"}, to: {id: "cat14"}) { from { id } }
      ur3: AddUserContributions(from: { id: "u3" }, to: { id: "p3" }) { from { id } }
      p3_t2: AddPostTags(
        from: { id: "p3" }
        to: { id: "t2" }
      ) { from { id } }
      p3_t4: AddPostTags(
        from: { id: "p3" }
        to: { id: "t4" }
      ) { from { id } }

      p4: CreatePost(
        id: "p4",
        title: "Lebensmittel (?)",
        content: "${faker.lorem.sentence()} ${faker.lorem.sentence()} ${faker.lorem.sentence()} ${faker.lorem.sentence()} ${faker.lorem.sentence()}",
        image: "https://picsum.photos/1280/1024?image=142",
        visibility: public,
        disabled: false,
        deleted: false
      ) { title }
      p4_cat1: AddPostCategories(from: {id: "p4"}, to: {id: "cat1"}) { from { id } }
      p4_cat9: AddPostCategories(from: {id: "p4"}, to: {id: "cat9"}) { from { id } }
      p4_cat4: AddPostCategories(from: {id: "p4"}, to: {id: "cat4"}) { from { id } }
      ur4: AddUserContributions(from: { id: "u4" }, to: { id: "p4" }) { from { id } }

      p5: CreatePost(
        id: "p5",
        title: "${faker.lorem.sentence()}",
        content: "${faker.lorem.sentence()} ${faker.lorem.sentence()} ${faker.lorem.sentence()} ${faker.lorem.sentence()} ${faker.lorem.sentence()}",
        image: "https://picsum.photos/1280/1024?image=231",
        visibility: public,
        disabled: false,
        deleted: false
      ) { title }
      p5_cat8: AddPostCategories(from: {id: "p5"}, to: {id: "cat8"}) { from { id } }
      p5_cat12: AddPostCategories(from: {id: "p5"}, to: {id: "cat12"}) { from { id } }
      ur5: AddUserContributions(from: { id: "u2" }, to: { id: "p5" }) { from { id } }

      p6: CreatePost(
        id: "p6",
        title: "${faker.lorem.sentence()}",
        content: "${faker.lorem.sentence()} ${faker.lorem.sentence()} ${faker.lorem.sentence()} ${faker.lorem.sentence()} ${faker.lorem.sentence()}",
        image: "https://picsum.photos/1280/1024?image=424",
        visibility: public,
        disabled: false,
        deleted: false
      ) { title }
      p6_cat1: AddPostCategories(from: {id: "p6"}, to: {id: "cat1"}) { from { id } }
      p6_cat2: AddPostCategories(from: {id: "p6"}, to: {id: "cat2"}) { from { id } }
      p6_cat5: AddPostCategories(from: {id: "p6"}, to: {id: "cat5"}) { from { id } }
      ur6: AddUserContributions(from: { id: "u4" }, to: { id: "p6" }) { from { id } }
    }
  `
}
