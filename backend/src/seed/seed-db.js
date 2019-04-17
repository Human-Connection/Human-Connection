import Factory from './factories'

/* eslint-disable no-multi-spaces */
(async function () {
  try {
    const f = Factory()
    await Promise.all([
      f.create('Badge', { id: 'b1', key: 'indiegogo_en_racoon', type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_racoon.svg' }),
      f.create('Badge', { id: 'b2', key: 'indiegogo_en_rabbit', type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_rabbit.svg' }),
      f.create('Badge', { id: 'b3', key: 'indiegogo_en_wolf',   type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_wolf.svg' }),
      f.create('Badge', { id: 'b4', key: 'indiegogo_en_bear',   type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_bear.svg' }),
      f.create('Badge', { id: 'b5', key: 'indiegogo_en_turtle', type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_turtle.svg' }),
      f.create('Badge', { id: 'b6', key: 'indiegogo_en_rhino',  type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_rhino.svg' })
    ])

    await Promise.all([
      f.create('User', { id: 'u1', name: 'Peter Lustig',       role: 'admin',     email: 'admin@example.org' }),
      f.create('User', { id: 'u2', name: 'Bob der Baumeister', role: 'moderator', email: 'moderator@example.org' }),
      f.create('User', { id: 'u3', name: 'Jenny Rostock',      role: 'user',      email: 'user@example.org' }),
      f.create('User', { id: 'u4', name: 'Tick',               role: 'user',      email: 'tick@example.org' }),
      f.create('User', { id: 'u5', name: 'Trick',              role: 'user',      email: 'trick@example.org' }),
      f.create('User', { id: 'u6', name: 'Track',              role: 'user',      email: 'track@example.org' }),
      f.create('User', { id: 'u7', name: 'Dagobert',           role: 'user',      email: 'dagobert@example.org' })
    ])

    const [ asAdmin, asModerator, asUser, asTick, asTrick, asTrack ] = await Promise.all([
      Factory().authenticateAs({ email: 'admin@example.org',     password: '1234' }),
      Factory().authenticateAs({ email: 'moderator@example.org', password: '1234' }),
      Factory().authenticateAs({ email: 'user@example.org',      password: '1234' }),
      Factory().authenticateAs({ email: 'tick@example.org',      password: '1234' }),
      Factory().authenticateAs({ email: 'trick@example.org',     password: '1234' }),
      Factory().authenticateAs({ email: 'track@example.org',     password: '1234' })
    ])

    await Promise.all([
      f.relate('User', 'Badges',      { from: 'b6', to: 'u1' }),
      f.relate('User', 'Badges',      { from: 'b5', to: 'u2' }),
      f.relate('User', 'Badges',      { from: 'b4', to: 'u3' }),
      f.relate('User', 'Badges',      { from: 'b3', to: 'u4' }),
      f.relate('User', 'Badges',      { from: 'b2', to: 'u5' }),
      f.relate('User', 'Badges',      { from: 'b1', to: 'u6' }),
      f.relate('User', 'Friends',     { from: 'u1', to: 'u2' }),
      f.relate('User', 'Friends',     { from: 'u1', to: 'u3' }),
      f.relate('User', 'Friends',     { from: 'u2', to: 'u3' }),
      f.relate('User', 'Blacklisted', { from: 'u7', to: 'u4' }),
      f.relate('User', 'Blacklisted', { from: 'u7', to: 'u5' }),
      f.relate('User', 'Blacklisted', { from: 'u7', to: 'u6' })
    ])

    await Promise.all([
      asAdmin
        .follow({ id: 'u3', type: 'User' }),
      asModerator
        .follow({ id: 'u4', type: 'User' }),
      asUser
        .follow({ id: 'u4', type: 'User' }),
      asTick
        .follow({ id: 'u6', type: 'User' }),
      asTrick
        .follow({ id: 'u4', type: 'User' }),
      asTrack
        .follow({ id: 'u3', type: 'User' })
    ])

    await Promise.all([
      f.create('Category', { id: 'cat1',  name: 'Just For Fun',                 slug: 'justforfun',                 icon: 'smile' }),
      f.create('Category', { id: 'cat2',  name: 'Happyness & Values',           slug: 'happyness-values',           icon: 'heart-o' }),
      f.create('Category', { id: 'cat3',  name: 'Health & Wellbeing',           slug: 'health-wellbeing',           icon: 'medkit' }),
      f.create('Category', { id: 'cat4',  name: 'Environment & Nature',         slug: 'environment-nature',         icon: 'tree' }),
      f.create('Category', { id: 'cat5',  name: 'Animal Protection',            slug: 'animalprotection',           icon: 'paw' }),
      f.create('Category', { id: 'cat6',  name: 'Humanrights Justice',          slug: 'humanrights-justice',        icon: 'balance-scale' }),
      f.create('Category', { id: 'cat7',  name: 'Education & Sciences',         slug: 'education-sciences',         icon: 'graduation-cap' }),
      f.create('Category', { id: 'cat8',  name: 'Cooperation & Development',    slug: 'cooperation-development',    icon: 'users' }),
      f.create('Category', { id: 'cat9',  name: 'Democracy & Politics',         slug: 'democracy-politics',         icon: 'university' }),
      f.create('Category', { id: 'cat10', name: 'Economy & Finances',           slug: 'economy-finances',           icon: 'money' }),
      f.create('Category', { id: 'cat11', name: 'Energy & Technology',          slug: 'energy-technology',          icon: 'flash' }),
      f.create('Category', { id: 'cat12', name: 'IT, Internet & Data Privacy',  slug: 'it-internet-dataprivacy',    icon: 'mouse-pointer' }),
      f.create('Category', { id: 'cat13', name: 'Art, Curlure & Sport',         slug: 'art-culture-sport',          icon: 'paint-brush' }),
      f.create('Category', { id: 'cat14', name: 'Freedom of Speech',            slug: 'freedomofspeech',            icon: 'bullhorn' }),
      f.create('Category', { id: 'cat15', name: 'Consumption & Sustainability', slug: 'consumption-sustainability', icon: 'shopping-cart' }),
      f.create('Category', { id: 'cat16', name: 'Global Peace & Nonviolence',   slug: 'globalpeace-nonviolence',    icon: 'angellist' })
    ])

    await Promise.all([
      f.create('Tag', { id: 't1', name: 'Umwelt' }),
      f.create('Tag', { id: 't2', name: 'Naturschutz' }),
      f.create('Tag', { id: 't3', name: 'Demokratie' }),
      f.create('Tag', { id: 't4', name: 'Freiheit' })
    ])

    await Promise.all([
      asAdmin.create('Post',     { id: 'p0' }),
      asModerator.create('Post', { id: 'p1' }),
      asUser.create('Post',      { id: 'p2', deleted: true }),
      asTick.create('Post',      { id: 'p3' }),
      asTrick.create('Post',     { id: 'p4' }),
      asTrack.create('Post',     { id: 'p5' }),
      asAdmin.create('Post',     { id: 'p6' }),
      asModerator.create('Post', { id: 'p7' }),
      asUser.create('Post',      { id: 'p8' }),
      asTick.create('Post',      { id: 'p9' }),
      asTrick.create('Post',     { id: 'p10' }),
      asTrack.create('Post',     { id: 'p11' }),
      asAdmin.create('Post',     { id: 'p12' }),
      asModerator.create('Post', { id: 'p13' }),
      asUser.create('Post',      { id: 'p14' }),
      asTick.create('Post',      { id: 'p15' })
    ])

    await Promise.all([
      f.relate('Post', 'Categories', { from: 'p0',  to: 'cat16' }),
      f.relate('Post', 'Categories', { from: 'p1',  to: 'cat1' }),
      f.relate('Post', 'Categories', { from: 'p2',  to: 'cat2' }),
      f.relate('Post', 'Categories', { from: 'p3',  to: 'cat3' }),
      f.relate('Post', 'Categories', { from: 'p4',  to: 'cat4' }),
      f.relate('Post', 'Categories', { from: 'p5',  to: 'cat5' }),
      f.relate('Post', 'Categories', { from: 'p6',  to: 'cat6' }),
      f.relate('Post', 'Categories', { from: 'p7',  to: 'cat7' }),
      f.relate('Post', 'Categories', { from: 'p8',  to: 'cat8' }),
      f.relate('Post', 'Categories', { from: 'p9',  to: 'cat9' }),
      f.relate('Post', 'Categories', { from: 'p10', to: 'cat10' }),
      f.relate('Post', 'Categories', { from: 'p11', to: 'cat11' }),
      f.relate('Post', 'Categories', { from: 'p12', to: 'cat12' }),
      f.relate('Post', 'Categories', { from: 'p13', to: 'cat13' }),
      f.relate('Post', 'Categories', { from: 'p14', to: 'cat14' }),
      f.relate('Post', 'Categories', { from: 'p15', to: 'cat15' }),

      f.relate('Post', 'Tags', { from: 'p0',  to: 't4' }),
      f.relate('Post', 'Tags', { from: 'p1',  to: 't1' }),
      f.relate('Post', 'Tags', { from: 'p2',  to: 't2' }),
      f.relate('Post', 'Tags', { from: 'p3',  to: 't3' }),
      f.relate('Post', 'Tags', { from: 'p4',  to: 't4' }),
      f.relate('Post', 'Tags', { from: 'p5',  to: 't1' }),
      f.relate('Post', 'Tags', { from: 'p6',  to: 't2' }),
      f.relate('Post', 'Tags', { from: 'p7',  to: 't3' }),
      f.relate('Post', 'Tags', { from: 'p8',  to: 't4' }),
      f.relate('Post', 'Tags', { from: 'p9',  to: 't1' }),
      f.relate('Post', 'Tags', { from: 'p10', to: 't2' }),
      f.relate('Post', 'Tags', { from: 'p11', to: 't3' }),
      f.relate('Post', 'Tags', { from: 'p12', to: 't4' }),
      f.relate('Post', 'Tags', { from: 'p13', to: 't1' }),
      f.relate('Post', 'Tags', { from: 'p14', to: 't2' }),
      f.relate('Post', 'Tags', { from: 'p15', to: 't3' })
    ])

    await Promise.all([
      asAdmin
        .shout({ id: 'p2', type: 'Post' }),
      asAdmin
        .shout({ id: 'p6', type: 'Post' }),
      asModerator
        .shout({ id: 'p0', type: 'Post' }),
      asModerator
        .shout({ id: 'p6', type: 'Post' }),
      asUser
        .shout({ id: 'p6', type: 'Post' }),
      asUser
        .shout({ id: 'p7', type: 'Post' }),
      asTick
        .shout({ id: 'p8', type: 'Post' }),
      asTick
        .shout({ id: 'p9', type: 'Post' }),
      asTrack
        .shout({ id: 'p10', type: 'Post' })
    ])
    await Promise.all([
      asAdmin
        .shout({ id: 'p2', type: 'Post' }),
      asAdmin
        .shout({ id: 'p6', type: 'Post' }),
      asModerator
        .shout({ id: 'p0', type: 'Post' }),
      asModerator
        .shout({ id: 'p6', type: 'Post' }),
      asUser
        .shout({ id: 'p6', type: 'Post' }),
      asUser
        .shout({ id: 'p7', type: 'Post' }),
      asTick
        .shout({ id: 'p8', type: 'Post' }),
      asTick
        .shout({ id: 'p9', type: 'Post' }),
      asTrack
        .shout({ id: 'p10', type: 'Post' })
    ])

    await Promise.all([
      f.create('Comment', { id: 'c1', postId: 'p1' }),
      f.create('Comment', { id: 'c2', postId: 'p1' }),
      f.create('Comment', { id: 'c3', postId: 'p3' }),
      f.create('Comment', { id: 'c4', postId: 'p2' }),
      f.create('Comment', { id: 'c5', postId: 'p3' }),
      f.create('Comment', { id: 'c6', postId: 'p4' }),
      f.create('Comment', { id: 'c7', postId: 'p2' }),
      f.create('Comment', { id: 'c8', postId: 'p15' }),
      f.create('Comment', { id: 'c9', postId: 'p15' }),
      f.create('Comment', { id: 'c10', postId: 'p15' }),
      f.create('Comment', { id: 'c11', postId: 'p15' }),
      f.create('Comment', { id: 'c12', postId: 'p15' })
    ])

    await Promise.all([
      f.relate('Comment', 'Author', { from: 'u3', to: 'c1' }),
      f.relate('Comment', 'Author', { from: 'u1', to: 'c2' }),
      f.relate('Comment', 'Author', { from: 'u1', to: 'c3' }),
      f.relate('Comment', 'Author', { from: 'u4', to: 'c4' }),
      f.relate('Comment', 'Author', { from: 'u4', to: 'c5' }),
      f.relate('Comment', 'Author', { from: 'u3', to: 'c6' }),
      f.relate('Comment', 'Author', { from: 'u2', to: 'c7' }),
      f.relate('Comment', 'Author', { from: 'u5', to: 'c8' }),
      f.relate('Comment', 'Author', { from: 'u6', to: 'c9' }),
      f.relate('Comment', 'Author', { from: 'u7', to: 'c10' }),
      f.relate('Comment', 'Author', { from: 'u5', to: 'c11' }),
      f.relate('Comment', 'Author', { from: 'u6', to: 'c12' })
    ])

    const disableMutation = 'mutation($id: ID!) { disable(id: $id) }'
    await Promise.all([
      asModerator.mutate(disableMutation, { id: 'p11' }),
      asModerator.mutate(disableMutation, { id: 'c5' })
    ])

    await Promise.all([
      asTick.create('Report',  { description: 'I don\'t like this comment', id: 'c1' }),
      asTrick.create('Report', { description: 'I don\'t like this post',    id: 'p1' }),
      asTrack.create('Report', { description: 'I don\'t like this user',    id: 'u1' })
    ])

    await Promise.all([
      f.create('Organization', { id: 'o1', name: 'Democracy Deutschland', description: 'Description for democracy-deutschland.' }),
      f.create('Organization', { id: 'o2', name: 'Human-Connection',      description: 'Description for human-connection.' }),
      f.create('Organization', { id: 'o3', name: 'Pro Veg',               description: 'Description for pro-veg.' }),
      f.create('Organization', { id: 'o4', name: 'Greenpeace',            description: 'Description for greenpeace.' })
    ])

    await Promise.all([
      f.relate('Organization', 'CreatedBy', { from: 'u1', to: 'o1' }),
      f.relate('Organization', 'CreatedBy', { from: 'u1', to: 'o2' }),
      f.relate('Organization', 'OwnedBy',   { from: 'u2', to: 'o2' }),
      f.relate('Organization', 'OwnedBy',   { from: 'u2', to: 'o3' })
    ])
    /* eslint-disable-next-line no-console */
    console.log('Seeded Data...')
  } catch (err) {
    /* eslint-disable-next-line no-console */
    console.error(err)
    process.exit(1)
  }
})()
/* eslint-enable no-multi-spaces */
