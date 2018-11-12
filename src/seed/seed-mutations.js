import faker from 'faker'

export default `
  mutation {

    # Users
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

    u1_blacklist_u4: AddUserBlacklisted(from: { id: "u1" }, to: { id: "u4" }) { from { id } }

    # Badges
    b1: CreateBadge(id: "b1", key: "indiegogo_en_racoon", type: crowdfunding, status: permanent, icon: "http://localhost:3000/img/badges/indiegogo_en_racoon.svg") { id }
    b2: CreateBadge(id: "b2", key: "indiegogo_en_rabbit", type: crowdfunding, status: permanent, icon: "http://localhost:3000/img/badges/indiegogo_en_rabbit.svg") { id }
    b3: CreateBadge(id: "b3", key: "indiegogo_en_wolf", type: crowdfunding, status: permanent, icon: "http://localhost:3000/img/badges/indiegogo_en_wolf.svg") { id }
    b4: CreateBadge(id: "b4", key: "indiegogo_en_bear", type: crowdfunding, status: permanent, icon: "http://localhost:3000/img/badges/indiegogo_en_bear.svg") { id }
    b5: CreateBadge(id: "b5", key: "indiegogo_en_turtle", type: crowdfunding, status: permanent, icon: "http://localhost:3000/img/badges/indiegogo_en_turtle.svg") { id }
    b6: CreateBadge(id: "b6", key: "indiegogo_en_rhino", type: crowdfunding, status: permanent, icon: "http://localhost:3000/img/badges/indiegogo_en_rhino.svg") { id }

    b1_u1: AddUserBadges(from: {id: "b1"}, to: {id: "u1"}) { from { id } }
    b2_u1: AddUserBadges(from: {id: "b2"}, to: {id: "u1"}) { from { id } }
    b3_u1: AddUserBadges(from: {id: "b3"}, to: {id: "u1"}) { from { id } }
    b6_u2: AddUserBadges(from: {id: "b6"}, to: {id: "u2"}) { from { id } }
    b3_u3: AddUserBadges(from: {id: "b3"}, to: {id: "u3"}) { from { id } }
    b5_u4: AddUserBadges(from: {id: "b5"}, to: {id: "u4"}) { from { id } }

    # categories
    cat1: CreateCategory( id: "cat1", name: "Just For Fun", slug: "justforfun", icon: "smile" ) { name }
    cat2: CreateCategory( id: "cat2", name: "Happyness & Values", slug: "happyness-values", icon: "heart-o" ) { name }
    cat3: CreateCategory( id: "cat3", name: "Health & Wellbeing", slug: "health-wellbeing", icon: "medkit" ) { name }
    cat4: CreateCategory( id: "cat4", name: "Environment & Nature", slug: "environment-nature", icon: "tree" ) { name }
    cat5: CreateCategory( id: "cat5", name: "Animal Protection", slug: "animalprotection", icon: "paw" ) { name }
    cat6: CreateCategory( id: "cat6", name: "Humanrights Justice", slug: "humanrights-justice", icon: "balance-scale" ) { name }
    cat7: CreateCategory( id: "cat7", name: "Education & Sciences", slug: "education-sciences", icon: "graduation-cap" ) { name }
    cat8: CreateCategory( id: "cat8", name: "Cooperation & Development", slug: "cooperation-development", icon: "users" ) { name }
    cat9: CreateCategory( id: "cat9", name: "Democracy & Politics", slug: "democracy-politics", icon: "university" ) { name }
    cat10: CreateCategory( id: "cat10", name: "Economy & Finances", slug: "economy-finances", icon: "money" ) { name }
    cat11: CreateCategory( id: "cat11", name: "Energy & Technology", slug: "energy-technology", icon: "flash" ) { name }
    cat12: CreateCategory( id: "cat12", name: "IT, Internet & Data Privacy", slug: "it-internet-dataprivacy", icon: "mouse-pointer" ) { name }
    cat13: CreateCategory( id: "cat13", name: "Art, Curlure & Sport", slug: "art-culture-sport", icon: "paint-brush" ) { name }
    cat14: CreateCategory( id: "cat14", name: "Freedom of Speech", slug: "freedomofspeech", icon: "bullhorn" ) { name }
    cat15: CreateCategory( id: "cat15", name: "Consumption & Sustainability", slug: "consumption-sustainability", icon: "shopping-cart" ) { name }
    cat16: CreateCategory( id: "cat16", name: "Global Peace & Nonviolence", slug: "globalpeace-nonviolence", icon: "angellist" ) { name }

    # Posts
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

    # Comments
    c1: CreateComment(
      id: "c1",
      content: "<p>da stimm ich dir zu. Mir ging das auch nie in den kopf, und hatte jesus nie als gott gesehen. </p>",
      disabled: false,
      deleted: false
    ) { id }
    c1_u1: AddCommentAuthor(from: { id: "u3" }, to: { id: "c1" }, data: { timestamp: 1538655020 }) { from { id } }

    c2: CreateComment(
      id: "c2",
      content: "<p>Schön das es dich gibt ❤️❤️❤️❤️❤️❤️❤️❤️❤️</p>",
      disabled: false,
      deleted: false
    ) { id }
    c2_u1: AddCommentAuthor(from: { id: "u1" }, to: { id: "c2" }, data: { timestamp: 1538655020 }) { from { id } }

    c3: CreateComment(
      id: "c3",
      content: "<p>Hi Dieter,</p><p>danke für Deine Info. Hast Du mal ein Foto von Deinem Cabrio mit dem Logo drauf?</p>",
      disabled: false,
      deleted: false
    ) { id }
    c3_u2: AddCommentAuthor(from: { id: "u1" }, to: { id: "c3" }, data: { timestamp: 1538655020 }) { from { id } }

    c4: CreateComment(
      id: "c4",
      content: "<p>Das Zusammenführen aller Gruppen, die mit uns am gleichen Strang in die gleiche Richtung ziehen, in eine gemeinsame Adressenstruktur sehe ich auch als Haupt - Aufgabe für unsere neue Netzwerkbildung an.</p>",
      disabled: false,
      deleted: false
    ) { id }
    c4_u3: AddCommentAuthor(from: { id: "u4" }, to: { id: "c4" }, data: { timestamp: 1538655020 }) { from { id } }

    c5: CreateComment(
      id: "c5",
      content: "${faker.lorem.paragraph()}",
      disabled: false,
      deleted: false
    ) { id }
    c5_u4: AddCommentAuthor(from: { id: "u4" }, to: { id: "c5" }, data: { timestamp: 1538655020 }) { from { id } }

    c6: CreateComment(
      id: "c6",
      content: "${faker.lorem.paragraph()}",
      disabled: false,
      deleted: false
    ) { id }
    c6_u3: AddCommentAuthor(from: { id: "u3" }, to: { id: "c6" }, data: { timestamp: 1538655020 }) { from { id } }

    c7: CreateComment(
      id: "c7",
      content: "${faker.lorem.paragraph()}",
      disabled: false,
      deleted: false
    ) { id }
    c7_u2: AddCommentAuthor(from: { id: "u2" }, to: { id: "c7" }, data: { timestamp: 1538655020 }) { from { id } }

    c1_p1: AddCommentPost(
      from: { id: "c1" },
      to: { id: "p1" }
    ) { from { id } }
    c2_p1: AddCommentPost(
      from: { id: "c2" },
      to: { id: "p1" }
    ) { from { id } }
    c3_p3: AddCommentPost(
      from: { id: "c3" },
      to: { id: "p3" }
    ) { from { id } }
    c4_p2: AddCommentPost(
      from: { id: "c4" },
      to: { id: "p2" }
    ) { from { id } }
    c5_p3: AddCommentPost(
      from: { id: "c5" },
      to: { id: "p3" }
    ) { from { id } }
    c6_p4: AddCommentPost(
      from: { id: "c6" },
      to: { id: "p4" }
    ) { from { id } }
    c6_p1: AddCommentPost(
      from: { id: "c6" },
      to: { id: "p1" }
    ) { from { id } }
    c7_p2: AddCommentPost(
      from: { id: "c7" },
      to: { id: "p2" }
    ) { from { id } }

    # Tags
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
    p2_t4: AddPostTags(
      from: { id: "p2" }
      to: { id: "t4" }
    ) { from { id } }
    p3_t2: AddPostTags(
      from: { id: "p3" }
      to: { id: "t2" }
    ) { from { id } }
    p3_t4: AddPostTags(
      from: { id: "p3" }
      to: { id: "t4" }
    ) { from { id } }

    o1: CreateOrganization(
      id: "o1",
      name: "Democracy Deutschland",
      description: "Description for democracy-deutschland.",
      disabled: false,
      deleted: false
    ) { name }
    o2: CreateOrganization(
      id: "o2",
      name: "Human-Connection",
      description: "Description for human-connection.",
      disabled: false,
      deleted: false
    ) { name }
    o3: CreateOrganization(
      id: "o3",
      name: "Pro Veg",
      description: "Description for pro-veg.",
      disabled: false,
      deleted: false
    ) { name }
    o4: CreateOrganization(
      id: "o4",
      name: "Greenpeace",
      description: "Description for greenpeace.",
      disabled: false,
      deleted: false
    ) { name }

    u1_c_o1: AddOrganizationCreatedBy(
      from: { id: "u1" },
      to: { id: "o1" }
    ) { from { id } }
    u1_c_o2: AddOrganizationCreatedBy(
      from: { id: "u1" },
      to: { id: "o2" }
    ) { from { id } }

    u2_o_o1: AddOrganizationOwnedBy(
      from: { id: "u2" },
      to: { id: "o2" }
    ) { from { id } }
    u2_c_o3: AddOrganizationOwnedBy(
      from: { id: "u2" },
      to: { id: "o3" }
    ) { from { id } }

    u1_friends_u2: AddUserFriends(
      from: { id: "u1" },
      to: { id: "u2" }
    ) { from { id } }
    u1_friends_u3: AddUserFriends(
      from: { id: "u1" },
      to: { id: "u3" }
    ) { from { id } }

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
