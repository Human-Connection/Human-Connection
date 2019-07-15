import faker from 'faker'
import Factory from './factories'

/* eslint-disable no-multi-spaces */
;
(async function () {
  try {
    const f = Factory()
    const [racoon, rabbit, wolf, bear, turtle, rhino] = await Promise.all([
      f.create('Badge', {
        id: 'indiegogo_en_racoon',
        icon: '/img/badges/indiegogo_en_racoon.svg',
      }),
      f.create('Badge', {
        id: 'indiegogo_en_rabbit',
        icon: '/img/badges/indiegogo_en_rabbit.svg',
      }),
      f.create('Badge', {
        id: 'indiegogo_en_wolf',
        icon: '/img/badges/indiegogo_en_wolf.svg',
      }),
      f.create('Badge', {
        id: 'indiegogo_en_bear',
        icon: '/img/badges/indiegogo_en_bear.svg',
      }),
      f.create('Badge', {
        id: 'indiegogo_en_turtle',
        icon: '/img/badges/indiegogo_en_turtle.svg',
      }),
      f.create('Badge', {
        id: 'indiegogo_en_rhino',
        icon: '/img/badges/indiegogo_en_rhino.svg',
      }),
    ])

    const [
      peterLustig,
      bobDerBaumeister,
      jennyRostock,
      tick, // eslint-disable-line no-unused-vars
      trick, // eslint-disable-line no-unused-vars
      track, // eslint-disable-line no-unused-vars
      dagobert,
    ] = await Promise.all([
      f.create('User', {
        id: 'u1',
        name: 'Peter Lustig',
        slug: 'peter-lustig',
        role: 'admin',
        email: 'admin@example.org',
      }),
      f.create('User', {
        id: 'u2',
        name: 'Bob der Baumeister',
        slug: 'bob-der-baumeister',
        role: 'moderator',
        email: 'moderator@example.org',
      }),
      f.create('User', {
        id: 'u3',
        name: 'Jenny Rostock',
        slug: 'jenny-rostock',
        role: 'user',
        email: 'user@example.org',
      }),
      f.create('User', {
        id: 'u4',
        name: 'Huey (Tick)',
        slug: 'huey-tick',
        role: 'user',
        email: 'huey@example.org',
      }),
      f.create('User', {
        id: 'u5',
        name: 'Dewey (Trick)',
        slug: 'dewey-trick',
        role: 'user',
        email: 'dewey@example.org',
      }),
      f.create('User', {
        id: 'u6',
        name: 'Louie (Track)',
        slug: 'louie-track',
        role: 'user',
        email: 'louie@example.org',
      }),
      f.create('User', {
        id: 'u7',
        name: 'Dagobert',
        slug: 'dagobert',
        role: 'user',
        email: 'dagobert@example.org',
      }),
    ])

    const [asAdmin, asModerator, asUser, asTick, asTrick, asTrack] = await Promise.all([
      Factory().authenticateAs({
        email: 'admin@example.org',
        password: '1234',
      }),
      Factory().authenticateAs({
        email: 'moderator@example.org',
        password: '1234',
      }),
      Factory().authenticateAs({
        email: 'user@example.org',
        password: '1234',
      }),
      Factory().authenticateAs({
        email: 'huey@example.org',
        password: '1234',
      }),
      Factory().authenticateAs({
        email: 'dewey@example.org',
        password: '1234',
      }),
      Factory().authenticateAs({
        email: 'louie@example.org',
        password: '1234',
      }),
    ])

    await Promise.all([
      peterLustig.relateTo(racoon, 'rewarded'),
      peterLustig.relateTo(rhino, 'rewarded'),
      peterLustig.relateTo(wolf, 'rewarded'),
      bobDerBaumeister.relateTo(racoon, 'rewarded'),
      bobDerBaumeister.relateTo(turtle, 'rewarded'),
      jennyRostock.relateTo(bear, 'rewarded'),
      dagobert.relateTo(rabbit, 'rewarded'),
    ])

    await Promise.all([
      f.relate('User', 'Friends', {
        from: 'u1',
        to: 'u2',
      }),
      f.relate('User', 'Friends', {
        from: 'u1',
        to: 'u3',
      }),
      f.relate('User', 'Friends', {
        from: 'u2',
        to: 'u3',
      }),
      f.relate('User', 'Blacklisted', {
        from: 'u7',
        to: 'u4',
      }),
      f.relate('User', 'Blacklisted', {
        from: 'u7',
        to: 'u5',
      }),
      f.relate('User', 'Blacklisted', {
        from: 'u7',
        to: 'u6',
      }),
    ])

    await Promise.all([
      asAdmin.follow({
        id: 'u3',
        type: 'User',
      }),
      asModerator.follow({
        id: 'u4',
        type: 'User',
      }),
      asUser.follow({
        id: 'u4',
        type: 'User',
      }),
      asTick.follow({
        id: 'u6',
        type: 'User',
      }),
      asTrick.follow({
        id: 'u4',
        type: 'User',
      }),
      asTrack.follow({
        id: 'u3',
        type: 'User',
      }),
    ])

    await Promise.all([
      f.create('Category', {
        id: 'cat1',
        name: 'Just For Fun',
        slug: 'justforfun',
        icon: 'smile',
      }),
      f.create('Category', {
        id: 'cat2',
        name: 'Happyness & Values',
        slug: 'happyness-values',
        icon: 'heart-o',
      }),
      f.create('Category', {
        id: 'cat3',
        name: 'Health & Wellbeing',
        slug: 'health-wellbeing',
        icon: 'medkit',
      }),
      f.create('Category', {
        id: 'cat4',
        name: 'Environment & Nature',
        slug: 'environment-nature',
        icon: 'tree',
      }),
      f.create('Category', {
        id: 'cat5',
        name: 'Animal Protection',
        slug: 'animalprotection',
        icon: 'paw',
      }),
      f.create('Category', {
        id: 'cat6',
        name: 'Humanrights Justice',
        slug: 'humanrights-justice',
        icon: 'balance-scale',
      }),
      f.create('Category', {
        id: 'cat7',
        name: 'Education & Sciences',
        slug: 'education-sciences',
        icon: 'graduation-cap',
      }),
      f.create('Category', {
        id: 'cat8',
        name: 'Cooperation & Development',
        slug: 'cooperation-development',
        icon: 'users',
      }),
      f.create('Category', {
        id: 'cat9',
        name: 'Democracy & Politics',
        slug: 'democracy-politics',
        icon: 'university',
      }),
      f.create('Category', {
        id: 'cat10',
        name: 'Economy & Finances',
        slug: 'economy-finances',
        icon: 'money',
      }),
      f.create('Category', {
        id: 'cat11',
        name: 'Energy & Technology',
        slug: 'energy-technology',
        icon: 'flash',
      }),
      f.create('Category', {
        id: 'cat12',
        name: 'IT, Internet & Data Privacy',
        slug: 'it-internet-dataprivacy',
        icon: 'mouse-pointer',
      }),
      f.create('Category', {
        id: 'cat13',
        name: 'Art, Curlure & Sport',
        slug: 'art-culture-sport',
        icon: 'paint-brush',
      }),
      f.create('Category', {
        id: 'cat14',
        name: 'Freedom of Speech',
        slug: 'freedomofspeech',
        icon: 'bullhorn',
      }),
      f.create('Category', {
        id: 'cat15',
        name: 'Consumption & Sustainability',
        slug: 'consumption-sustainability',
        icon: 'shopping-cart',
      }),
      f.create('Category', {
        id: 'cat16',
        name: 'Global Peace & Nonviolence',
        slug: 'globalpeace-nonviolence',
        icon: 'angellist',
      }),
    ])

    await Promise.all([
      f.create('Tag', {
        id: 'Umwelt',
        name: 'Umwelt',
      }),
      f.create('Tag', {
        id: 'Naturschutz',
        name: 'Naturschutz',
      }),
      f.create('Tag', {
        id: 'Demokratie',
        name: 'Demokratie',
      }),
      f.create('Tag', {
        id: 'Freiheit',
        name: 'Freiheit',
      }),
    ])

    const mention1 = 'Hey <a class="mention" href="/profile/u3">@jenny-rostock</a>, what\'s up?'
    const mention2 =
      'Hey <a class="mention" href="/profile/u3">@jenny-rostock</a>, here is another notification for you!'
    const hashtag1 = 'See <a class="hashtag" href="/search/hashtag/NaturphilosophieYoga">#NaturphilosophieYoga</a> can really help you!'
    const hashtagAndMention1 = 'The new physics of <a class="hashtag" href="/search/hashtag/QuantenFlussTheorie">#QuantenFlussTheorie</a> can explain <a class="hashtag" href="/search/hashtag/QuantumGravity">#QuantumGravity</a>! <a class="mention" href="/profile/u1">@peter-lustig</a> got that already. ;-)'

    await Promise.all([
      asAdmin.create('Post', {
        id: 'p0',
        image: faker.image.unsplash.food(),
      }),
      asModerator.create('Post', {
        id: 'p1',
        image: faker.image.unsplash.technology(),
      }),
      asUser.create('Post', {
        id: 'p2',
        title: `Nature Philosophy Yoga`,
        content: `${hashtag1}`,
      }),
      asTick.create('Post', {
        id: 'p3',
      }),
      asTrick.create('Post', {
        id: 'p4',
      }),
      asTrack.create('Post', {
        id: 'p5',
      }),
      asAdmin.create('Post', {
        id: 'p6',
        image: faker.image.unsplash.buildings(),
      }),
      asModerator.create('Post', {
        id: 'p7',
        content: `${mention1} ${faker.lorem.paragraph()}`,
      }),
      asUser.create('Post', {
        id: 'p8',
        image: faker.image.unsplash.nature(),
        title: `Quantum Flow Theory explains Quantum Gravity`,
        content: `${hashtagAndMention1}`,
      }),
      asTick.create('Post', {
        id: 'p9',
      }),
      asTrick.create('Post', {
        id: 'p10',
      }),
      asTrack.create('Post', {
        id: 'p11',
        image: faker.image.unsplash.people(),
      }),
      asAdmin.create('Post', {
        id: 'p12',
        content: `${mention2} ${faker.lorem.paragraph()}`,
      }),
      asModerator.create('Post', {
        id: 'p13',
      }),
      asUser.create('Post', {
        id: 'p14',
        image: faker.image.unsplash.objects(),
      }),
      asTick.create('Post', {
        id: 'p15',
      }),
    ])

    await Promise.all([
      f.relate('Post', 'Categories', {
        from: 'p0',
        to: 'cat16',
      }),
      f.relate('Post', 'Categories', {
        from: 'p1',
        to: 'cat1',
      }),
      f.relate('Post', 'Categories', {
        from: 'p2',
        to: 'cat2',
      }),
      f.relate('Post', 'Categories', {
        from: 'p3',
        to: 'cat3',
      }),
      f.relate('Post', 'Categories', {
        from: 'p4',
        to: 'cat4',
      }),
      f.relate('Post', 'Categories', {
        from: 'p5',
        to: 'cat5',
      }),
      f.relate('Post', 'Categories', {
        from: 'p6',
        to: 'cat6',
      }),
      f.relate('Post', 'Categories', {
        from: 'p7',
        to: 'cat7',
      }),
      f.relate('Post', 'Categories', {
        from: 'p8',
        to: 'cat8',
      }),
      f.relate('Post', 'Categories', {
        from: 'p9',
        to: 'cat9',
      }),
      f.relate('Post', 'Categories', {
        from: 'p10',
        to: 'cat10',
      }),
      f.relate('Post', 'Categories', {
        from: 'p11',
        to: 'cat11',
      }),
      f.relate('Post', 'Categories', {
        from: 'p12',
        to: 'cat12',
      }),
      f.relate('Post', 'Categories', {
        from: 'p13',
        to: 'cat13',
      }),
      f.relate('Post', 'Categories', {
        from: 'p14',
        to: 'cat14',
      }),
      f.relate('Post', 'Categories', {
        from: 'p15',
        to: 'cat15',
      }),

      f.relate('Post', 'Tags', {
        from: 'p0',
        to: 'Freiheit',
      }),
      f.relate('Post', 'Tags', {
        from: 'p1',
        to: 'Umwelt',
      }),
      f.relate('Post', 'Tags', {
        from: 'p2',
        to: 'Naturschutz',
      }),
      f.relate('Post', 'Tags', {
        from: 'p3',
        to: 'Demokratie',
      }),
      f.relate('Post', 'Tags', {
        from: 'p4',
        to: 'Freiheit',
      }),
      f.relate('Post', 'Tags', {
        from: 'p5',
        to: 'Umwelt',
      }),
      f.relate('Post', 'Tags', {
        from: 'p6',
        to: 'Naturschutz',
      }),
      f.relate('Post', 'Tags', {
        from: 'p7',
        to: 'Demokratie',
      }),
      f.relate('Post', 'Tags', {
        from: 'p8',
        to: 'Freiheit',
      }),
      f.relate('Post', 'Tags', {
        from: 'p9',
        to: 'Umwelt',
      }),
      f.relate('Post', 'Tags', {
        from: 'p10',
        to: 'Naturschutz',
      }),
      f.relate('Post', 'Tags', {
        from: 'p11',
        to: 'Demokratie',
      }),
      f.relate('Post', 'Tags', {
        from: 'p12',
        to: 'Freiheit',
      }),
      f.relate('Post', 'Tags', {
        from: 'p13',
        to: 'Umwelt',
      }),
      f.relate('Post', 'Tags', {
        from: 'p14',
        to: 'Naturschutz',
      }),
      f.relate('Post', 'Tags', {
        from: 'p15',
        to: 'Demokratie',
      }),
    ])

    await Promise.all([
      asAdmin.shout({
        id: 'p2',
        type: 'Post',
      }),
      asAdmin.shout({
        id: 'p6',
        type: 'Post',
      }),
      asModerator.shout({
        id: 'p0',
        type: 'Post',
      }),
      asModerator.shout({
        id: 'p6',
        type: 'Post',
      }),
      asUser.shout({
        id: 'p6',
        type: 'Post',
      }),
      asUser.shout({
        id: 'p7',
        type: 'Post',
      }),
      asTick.shout({
        id: 'p8',
        type: 'Post',
      }),
      asTick.shout({
        id: 'p9',
        type: 'Post',
      }),
      asTrack.shout({
        id: 'p10',
        type: 'Post',
      }),
    ])
    await Promise.all([
      asAdmin.shout({
        id: 'p2',
        type: 'Post',
      }),
      asAdmin.shout({
        id: 'p6',
        type: 'Post',
      }),
      asModerator.shout({
        id: 'p0',
        type: 'Post',
      }),
      asModerator.shout({
        id: 'p6',
        type: 'Post',
      }),
      asUser.shout({
        id: 'p6',
        type: 'Post',
      }),
      asUser.shout({
        id: 'p7',
        type: 'Post',
      }),
      asTick.shout({
        id: 'p8',
        type: 'Post',
      }),
      asTick.shout({
        id: 'p9',
        type: 'Post',
      }),
      asTrack.shout({
        id: 'p10',
        type: 'Post',
      }),
    ])

    const mentionInComment1 = 'I heard <a class="mention" href="/profile/u3">@jenny-rostock</a>, practice it since 3 years now.'
    const mentionInComment2 = 'Did <a class="mention" href="/profile/u1">@peter-lustig</a> told you?'

    await Promise.all([
      asUser.create('Comment', {
        id: 'c1',
        postId: 'p1',
      }),
      asTick.create('Comment', {
        id: 'c2',
        postId: 'p1',
      }),
      asTrack.create('Comment', {
        id: 'c3',
        postId: 'p3',
      }),
      asTrick.create('Comment', {
        id: 'c4',
        postId: 'p2',
        content: `${mentionInComment1}`,
      }),
      asUser.create('Comment', {
        id: 'c4-1',
        postId: 'p2',
        content: `${mentionInComment2}`,
      }),
      asModerator.create('Comment', {
        id: 'c5',
        postId: 'p3',
      }),
      asAdmin.create('Comment', {
        id: 'c6',
        postId: 'p4',
      }),
      asUser.create('Comment', {
        id: 'c7',
        postId: 'p2',
      }),
      asTick.create('Comment', {
        id: 'c8',
        postId: 'p15',
      }),
      asTrick.create('Comment', {
        id: 'c9',
        postId: 'p15',
      }),
      asTrack.create('Comment', {
        id: 'c10',
        postId: 'p15',
      }),
      asUser.create('Comment', {
        id: 'c11',
        postId: 'p15',
      }),
      asUser.create('Comment', {
        id: 'c12',
        postId: 'p15',
      }),
    ])

    const disableMutation = 'mutation($id: ID!) { disable(id: $id) }'
    await Promise.all([
      asModerator.mutate(disableMutation, {
        id: 'p11',
      }),
      asModerator.mutate(disableMutation, {
        id: 'c5',
      }),
    ])

    await Promise.all([
      asTick.create('Report', {
        description: "I don't like this comment",
        id: 'c1',
      }),
      asTrick.create('Report', {
        description: "I don't like this post",
        id: 'p1',
      }),
      asTrack.create('Report', {
        description: "I don't like this user",
        id: 'u1',
      }),
    ])

    await Promise.all([
      f.create('Organization', {
        id: 'o1',
        name: 'Democracy Deutschland',
        description: 'Description for democracy-deutschland.',
      }),
      f.create('Organization', {
        id: 'o2',
        name: 'Human-Connection',
        description: 'Description for human-connection.',
      }),
      f.create('Organization', {
        id: 'o3',
        name: 'Pro Veg',
        description: 'Description for pro-veg.',
      }),
      f.create('Organization', {
        id: 'o4',
        name: 'Greenpeace',
        description: 'Description for greenpeace.',
      }),
    ])

    await Promise.all([
      f.relate('Organization', 'CreatedBy', {
        from: 'u1',
        to: 'o1',
      }),
      f.relate('Organization', 'CreatedBy', {
        from: 'u1',
        to: 'o2',
      }),
      f.relate('Organization', 'OwnedBy', {
        from: 'u2',
        to: 'o2',
      }),
      f.relate('Organization', 'OwnedBy', {
        from: 'u2',
        to: 'o3',
      }),
    ])
    /* eslint-disable-next-line no-console */
    console.log('Seeded Data...')
    process.exit(0)
  } catch (err) {
    /* eslint-disable-next-line no-console */
    console.error(err)
    process.exit(1)
  }
})()
/* eslint-enable no-multi-spaces */