export default `
  mutation {
    u1: CreateUser(id: "u1", name: "Will Blast", email: "Will-Blast@Yahoo.com", role: Admin) {
      id
      name
      email
      role
    }
    u2: CreateUser(id: "u2", name: "Bob der Bausmeister", email: "Bob-der-Bausmeister@yahoo.com", role: Moderator) {
      id
      name
      email
      role
    }
    u3: CreateUser(id: "u3", name: "Jenny Rostock", email: "JennyRostock@yahoo.com", role: Admin) {
      id
      name
      email
      role
    }
    u4: CreateUser(id: "u4", name: "Angie Banjie", email: "Angie_Banjie@yahoo.com", role: User) {
      id
      name
      email
      role
    }

    cat1: CreateCategory( id: "cat1", name: "Just For Fun", slug: "justforfun", icon: "categories-justforfun" ) { name }
    cat2: CreateCategory( id: "cat2", name: "Happyness & Values", slug: "happyness-values", icon: "categories-luck" ) { name }
    cat3: CreateCategory( id: "cat3", name: "Health & Wellbeing", slug: "health-wellbeing", icon: "categories-health" ) { name }
    cat4: CreateCategory( id: "cat4", name: "Environment & Nature", slug: "environment-nature", icon: "categories-environment" ) { name }
    cat5: CreateCategory( id: "cat5", name: "Animal Protection", slug: "animalprotection", icon: "categories-animal-justice" ) { name }
    cat6: CreateCategory( id: "cat6", name: "Humanrights Justice", slug: "humanrights-justice", icon: "categories-human-rights" ) { name }
    cat7: CreateCategory( id: "cat7", name: "Education & Sciences", slug: "education-sciences", icon: "categories-education" ) { name }
    cat8: CreateCategory( id: "cat8", name: "Cooperation & Development", slug: "cooperation-development", icon: "categories-cooperation" ) { name }
    cat9: CreateCategory( id: "cat9", name: "Democracy & Politics", slug: "democracy-politics", icon: "categories-politics" ) { name }
    cat10: CreateCategory( id: "cat10", name: "Economy & Finances", slug: "economy-finances", icon: "categories-economy" ) { name }
    cat11: CreateCategory( id: "cat11", name: "Energy & Technology", slug: "energy-technology", icon: "categories-technology" ) { name }
    cat12: CreateCategory( id: "cat12", name: "IT, Internet & Data Privacy", slug: "it-internet-dataprivacy", icon: "categories-internet" ) { name }
    cat13: CreateCategory( id: "cat13", name: "Art, Curlure & Sport", slug: "art-culture-sport", icon: "categories-art" ) { name }
    cat14: CreateCategory( id: "cat14", name: "Freedom of Speech", slug: "freedomofspeech", icon: "categories-freedom-of-speech" ) { name }
    cat15: CreateCategory( id: "cat15", name: "Consumption & Sustainability", slug: "consumption-sustainability", icon: "categories-sustainability" ) { name }
    cat16: CreateCategory( id: "cat16", name: "Global Peace & Nonviolence", slug: "globalpeace-nonviolence", icon: "categories-peace" ) { name }

    p1: CreatePost(
      id: "p1",
      title: "Gedanken eines Polizisten zum Einsatz im Hambacher Forst",
      slug: "gedanken-eines-polizisten-zum-einsatz-im-hambacher-forst",
      content: "# 1 This is my content 1",
      contentExcerpt: "# 1 This is my content 1",
      visibility: Public
    ) { title }
    p1_cat1: AddPostCategories(from: {id: "p1"}, to: {id: "cat1"}) { from { id } }
    p1_cat2: AddPostCategories(from: {id: "p1"}, to: {id: "cat2"}) { from { id } }

    p2: CreatePost(
      id: "p2",
      title: "Julian Assange",
      slug: "julian-assange",
      content: "#2 This is my content 2",
      contentExcerpt: "#2 This is my content 2",
      visibility: Public
    ) { title }
    p2_cat1: AddPostCategories(from: {id: "p2"}, to: {id: "cat1"}) { from { id } }
    p2_cat16: AddPostCategories(from: {id: "p2"}, to: {id: "cat16"}) { from { id } }

    p3: CreatePost(
      id: "p3",
      title: "Hacker, Freaks und Funktionäre...Der CCC",
      slug: "hacker-freaks-und-funktionäre-der-ccc",
      content: "#3 This is my content 3",
      contentExcerpt: "#3 This is my content 3",
      visibility: Public
    ) { title }
    p3_cat1: AddPostCategories(from: {id: "p3"}, to: {id: "cat1"}) { from { id } }
    p3_cat3: AddPostCategories(from: {id: "p3"}, to: {id: "cat3"}) { from { id } }
    p3_cat14: AddPostCategories(from: {id: "p3"}, to: {id: "cat14"}) { from { id } }

    p4: CreatePost(
      id: "p4",
      title: "Lebensmittel (?)",
      slug: "lebensmittel",
      content: "#4 This is my content 4",
      contentExcerpt: "#4 This is my content 4",
      visibility: Public
    ) { title }
    p4_cat1: AddPostCategories(from: {id: "p4"}, to: {id: "cat1"}) { from { id } }
    p4_cat9: AddPostCategories(from: {id: "p4"}, to: {id: "cat9"}) { from { id } }
    p4_cat4: AddPostCategories(from: {id: "p4"}, to: {id: "cat4"}) { from { id } }

    c1: CreateComment(
      id: "c1",
      content: "# 1 This is my comment 1",
      contentExcerpt: "# 1 This is my..."
    ) { id }
    c2: CreateComment(
      id: "c2",
      content: "# 2 This is my comment 2",
      contentExcerpt: "# 2 This is my..."
    ) { id }
    c3: CreateComment(
      id: "c3",
      content: "# 3 This is my comment 3",
      contentExcerpt: "# 3 This is my..."
    ) { id }
    c4: CreateComment(
      id: "c4",
      content: "# 4 This is my comment 4",
      contentExcerpt: "# 4 This is my..."
    ) { id }
    c5: CreateComment(
      id: "c5",
      content: "# 5 This is my comment 5",
      contentExcerpt: "# 5 This is my..."
    ) { id }

    c1_u1: AddCommentAuthor(
      from: { id: "u1" },
      to: { id: "c1" },
      data: { timestamp: 1538655020 }
    ) { from { id } }
    c2_u1: AddCommentAuthor(
      from: { id: "u1" },
      to: { id: "c2" },
      data: { timestamp: 1538655020 }
    ) { from { id } }
    c3_u2: AddCommentAuthor(
      from: { id: "u2" },
      to: { id: "c3" },
      data: { timestamp: 1538655020 }
    ) { from { id } }
    c4_u3: AddCommentAuthor(
      from: { id: "u3" },
      to: { id: "c4" },
      data: { timestamp: 1538655020 }
    ) { from { id } }
    c5_u4: AddCommentAuthor(
      from: { id: "u4" },
      to: { id: "c5" },
      data: { timestamp: 1538655020 }
    ) { from { id } }

    c1_p1: AddCommentPost(
      from: { id: "c1" },
      to: { id: "p1" }
    ) { from { id } }
    c2_p1: AddCommentPost(
      from: { id: "c2" },
      to: { id: "p1" }
    ) { from { id } }
    c3_p2: AddCommentPost(
      from: { id: "c3" },
      to: { id: "p2" }
    ) { from { id } }
    c4_p3: AddCommentPost(
      from: { id: "c4" },
      to: { id: "p3" }
    ) { from { id } }
    c5_p4: AddCommentPost(
      from: { id: "c5" },
      to: { id: "p4" }
    ) { from { id } }

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
      slug: "democracy-deutschland"
    ) { name }
    o2: CreateOrganization(
      id: "o2",
      name: "Human-Connection",
      slug: "human-connection"
    ) { name }
    o3: CreateOrganization(
      id: "o3",
      name: "Pro Veg",
      slug: "pro-veg"
    ) { name }
    o4: CreateOrganization(
      id: "o4",
      name: "Greenpeace",
      slug: "greenpeace"
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

    ur1: AddUserContributions(
      from: { id: "u1" },
      to: { id: "p1" },
      data: { timestamp: 1538655020 }
    ) { from { id } }
    ur2: AddUserContributions(
      from: { id: "u2" },
      to: { id: "p2" },
      data: { timestamp: 1538655120 }
    ) { from { id } }
    ur3: AddUserContributions(
      from: { id: "u3" },
      to: { id: "p3" },
      data: { timestamp: 1538653120 }
    ) { from { id } }
    ur4: AddUserContributions(
      from: { id: "u4" },
      to: { id: "p4" },
      data: { timestamp: 1538615120 }
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
