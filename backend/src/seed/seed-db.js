import faker from 'faker'
import sample from 'lodash/sample'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../server'
import Factory from './factories'
import { getNeode, getDriver } from '../bootstrap/neo4j'
import { gql } from '../helpers/jest'

const languages = ['de', 'en', 'es', 'fr', 'it', 'pt', 'pl']

/* eslint-disable no-multi-spaces */
;(async function() {
  let authenticatedUser = null
  const driver = getDriver()
  const factory = Factory()
  const neode = getNeode()

  try {
    const { server } = createServer({
      context: () => {
        return {
          driver,
          neode,
          user: authenticatedUser,
        }
      },
    })
    const { mutate } = createTestClient(server)

    const [Hamburg, Berlin, Germany, Paris, France] = await Promise.all([
      factory.create('Location', {
        id: 'region.5127278006398860',
        name: 'Hamburg',
        type: 'region',
        lat: 10.0,
        lng: 53.55,
        nameES: 'Hamburgo',
        nameFR: 'Hambourg',
        nameIT: 'Amburgo',
        nameEN: 'Hamburg',
        namePT: 'Hamburgo',
        nameDE: 'Hamburg',
        nameNL: 'Hamburg',
        namePL: 'Hamburg',
        nameRU: 'Гамбург',
      }),
      factory.create('Location', {
        id: 'region.14880313158564380',
        type: 'region',
        name: 'Berlin',
        lat: 13.38333,
        lng: 52.51667,
        nameES: 'Berlín',
        nameFR: 'Berlin',
        nameIT: 'Berlino',
        nameEN: 'Berlin',
        namePT: 'Berlim',
        nameDE: 'Berlin',
        nameNL: 'Berlijn',
        namePL: 'Berlin',
        nameRU: 'Берлин',
      }),
      factory.create('Location', {
        id: 'country.10743216036480410',
        name: 'Germany',
        type: 'country',
        namePT: 'Alemanha',
        nameDE: 'Deutschland',
        nameES: 'Alemania',
        nameNL: 'Duitsland',
        namePL: 'Niemcy',
        nameFR: 'Allemagne',
        nameIT: 'Germania',
        nameEN: 'Germany',
        nameRU: 'Германия',
      }),
      factory.create('Location', {
        id: 'region.9397217726497330',
        name: 'Paris',
        type: 'region',
        lat: 2.35183,
        lng: 48.85658,
        nameES: 'París',
        nameFR: 'Paris',
        nameIT: 'Parigi',
        nameEN: 'Paris',
        namePT: 'Paris',
        nameDE: 'Paris',
        nameNL: 'Parijs',
        namePL: 'Paryż',
        nameRU: 'Париж',
      }),
      factory.create('Location', {
        id: 'country.9759535382641660',
        name: 'France',
        type: 'country',
        namePT: 'França',
        nameDE: 'Frankreich',
        nameES: 'Francia',
        nameNL: 'Frankrijk',
        namePL: 'Francja',
        nameFR: 'France',
        nameIT: 'Francia',
        nameEN: 'France',
        nameRU: 'Франция',
      }),
    ])
    await Promise.all([
      Berlin.relateTo(Germany, 'isIn'),
      Hamburg.relateTo(Germany, 'isIn'),
      Paris.relateTo(France, 'isIn'),
    ])

    const [racoon, rabbit, wolf, bear, turtle, rhino] = await Promise.all([
      factory.create('Badge', {
        id: 'indiegogo_en_racoon',
        icon: '/img/badges/indiegogo_en_racoon.svg',
      }),
      factory.create('Badge', {
        id: 'indiegogo_en_rabbit',
        icon: '/img/badges/indiegogo_en_rabbit.svg',
      }),
      factory.create('Badge', {
        id: 'indiegogo_en_wolf',
        icon: '/img/badges/indiegogo_en_wolf.svg',
      }),
      factory.create('Badge', {
        id: 'indiegogo_en_bear',
        icon: '/img/badges/indiegogo_en_bear.svg',
      }),
      factory.create('Badge', {
        id: 'indiegogo_en_turtle',
        icon: '/img/badges/indiegogo_en_turtle.svg',
      }),
      factory.create('Badge', {
        id: 'indiegogo_en_rhino',
        icon: '/img/badges/indiegogo_en_rhino.svg',
      }),
    ])

    const [
      peterLustig,
      bobDerBaumeister,
      jennyRostock,
      huey,
      dewey,
      louie,
      dagobert,
    ] = await Promise.all([
      factory.create('User', {
        id: 'u1',
        name: 'Peter Lustig',
        slug: 'peter-lustig',
        role: 'admin',
        email: 'admin@example.org',
      }),
      factory.create('User', {
        id: 'u2',
        name: 'Bob der Baumeister',
        slug: 'bob-der-baumeister',
        role: 'moderator',
        email: 'moderator@example.org',
      }),
      factory.create('User', {
        id: 'u3',
        name: 'Jenny Rostock',
        slug: 'jenny-rostock',
        role: 'user',
        email: 'user@example.org',
      }),
      factory.create('User', {
        id: 'u4',
        name: 'Huey',
        slug: 'huey',
        role: 'user',
        email: 'huey@example.org',
      }),
      factory.create('User', {
        id: 'u5',
        name: 'Dewey',
        slug: 'dewey',
        role: 'user',
        email: 'dewey@example.org',
      }),
      factory.create('User', {
        id: 'u6',
        name: 'Louie',
        slug: 'louie',
        role: 'user',
        email: 'louie@example.org',
      }),
      factory.create('User', {
        id: 'u7',
        name: 'Dagobert',
        slug: 'dagobert',
        role: 'user',
        email: 'dagobert@example.org',
      }),
    ])

    await Promise.all([
      peterLustig.relateTo(Berlin, 'isIn'),
      bobDerBaumeister.relateTo(Hamburg, 'isIn'),
      jennyRostock.relateTo(Paris, 'isIn'),
      huey.relateTo(Paris, 'isIn'),
    ])

    await Promise.all([
      peterLustig.relateTo(racoon, 'rewarded'),
      peterLustig.relateTo(rhino, 'rewarded'),
      peterLustig.relateTo(wolf, 'rewarded'),
      bobDerBaumeister.relateTo(racoon, 'rewarded'),
      bobDerBaumeister.relateTo(turtle, 'rewarded'),
      jennyRostock.relateTo(bear, 'rewarded'),
      dagobert.relateTo(rabbit, 'rewarded'),

      peterLustig.relateTo(bobDerBaumeister, 'friends'),
      peterLustig.relateTo(jennyRostock, 'friends'),
      bobDerBaumeister.relateTo(jennyRostock, 'friends'),

      peterLustig.relateTo(jennyRostock, 'following'),
      peterLustig.relateTo(huey, 'following'),
      bobDerBaumeister.relateTo(huey, 'following'),
      jennyRostock.relateTo(huey, 'following'),
      huey.relateTo(dewey, 'following'),
      dewey.relateTo(huey, 'following'),
      louie.relateTo(jennyRostock, 'following'),

      dagobert.relateTo(huey, 'blocked'),
      dagobert.relateTo(dewey, 'blocked'),
      dagobert.relateTo(louie, 'blocked'),
    ])

    await Promise.all([
      factory.create('Category', {
        id: 'cat1',
        name: 'Just For Fun',
        slug: 'just-for-fun',
        icon: 'smile',
      }),
      factory.create('Category', {
        id: 'cat2',
        name: 'Happiness & Values',
        slug: 'happiness-values',
        icon: 'heart-o',
      }),
      factory.create('Category', {
        id: 'cat3',
        name: 'Health & Wellbeing',
        slug: 'health-wellbeing',
        icon: 'medkit',
      }),
      factory.create('Category', {
        id: 'cat4',
        name: 'Environment & Nature',
        slug: 'environment-nature',
        icon: 'tree',
      }),
      factory.create('Category', {
        id: 'cat5',
        name: 'Animal Protection',
        slug: 'animal-protection',
        icon: 'paw',
      }),
      factory.create('Category', {
        id: 'cat6',
        name: 'Human Rights & Justice',
        slug: 'human-rights-justice',
        icon: 'balance-scale',
      }),
      factory.create('Category', {
        id: 'cat7',
        name: 'Education & Sciences',
        slug: 'education-sciences',
        icon: 'graduation-cap',
      }),
      factory.create('Category', {
        id: 'cat8',
        name: 'Cooperation & Development',
        slug: 'cooperation-development',
        icon: 'users',
      }),
      factory.create('Category', {
        id: 'cat9',
        name: 'Democracy & Politics',
        slug: 'democracy-politics',
        icon: 'university',
      }),
      factory.create('Category', {
        id: 'cat10',
        name: 'Economy & Finances',
        slug: 'economy-finances',
        icon: 'money',
      }),
      factory.create('Category', {
        id: 'cat11',
        name: 'Energy & Technology',
        slug: 'energy-technology',
        icon: 'flash',
      }),
      factory.create('Category', {
        id: 'cat12',
        name: 'IT, Internet & Data Privacy',
        slug: 'it-internet-data-privacy',
        icon: 'mouse-pointer',
      }),
      factory.create('Category', {
        id: 'cat13',
        name: 'Art, Culture & Sport',
        slug: 'art-culture-sport',
        icon: 'paint-brush',
      }),
      factory.create('Category', {
        id: 'cat14',
        name: 'Freedom of Speech',
        slug: 'freedom-of-speech',
        icon: 'bullhorn',
      }),
      factory.create('Category', {
        id: 'cat15',
        name: 'Consumption & Sustainability',
        slug: 'consumption-sustainability',
        icon: 'shopping-cart',
      }),
      factory.create('Category', {
        id: 'cat16',
        name: 'Global Peace & Nonviolence',
        slug: 'global-peace-nonviolence',
        icon: 'angellist',
      }),
    ])

    const [environment, nature, democracy, freedom] = await Promise.all([
      factory.create('Tag', {
        id: 'Environment',
      }),
      factory.create('Tag', {
        id: 'Nature',
      }),
      factory.create('Tag', {
        id: 'Democracy',
      }),
      factory.create('Tag', {
        id: 'Freedom',
      }),
    ])

    const [p0, p1, p3, p4, p5, p6, p9, p10, p11, p13, p14, p15] = await Promise.all([
      factory.create('Post', {
        author: peterLustig,
        id: 'p0',
        language: sample(languages),
        image: faker.image.unsplash.food(300, 169),
        categoryIds: ['cat16'],
        imageAspectRatio: 300 / 169,
      }),
      factory.create('Post', {
        author: bobDerBaumeister,
        id: 'p1',
        language: sample(languages),
        image: faker.image.unsplash.technology(300, 1500),
        categoryIds: ['cat1'],
        imageAspectRatio: 300 / 1500,
      }),
      factory.create('Post', {
        author: huey,
        id: 'p3',
        language: sample(languages),
        categoryIds: ['cat3'],
      }),
      factory.create('Post', {
        author: dewey,
        id: 'p4',
        language: sample(languages),
        categoryIds: ['cat4'],
      }),
      factory.create('Post', {
        author: louie,
        id: 'p5',
        language: sample(languages),
        categoryIds: ['cat5'],
      }),
      factory.create('Post', {
        authorId: 'u1',
        id: 'p6',
        language: sample(languages),
        image: faker.image.unsplash.buildings(300, 857),
        categoryIds: ['cat6'],
        imageAspectRatio: 300 / 857,
      }),
      factory.create('Post', {
        author: huey,
        id: 'p9',
        language: sample(languages),
        categoryIds: ['cat9'],
      }),
      factory.create('Post', {
        author: dewey,
        id: 'p10',
        categoryIds: ['cat10'],
      }),
      factory.create('Post', {
        author: louie,
        id: 'p11',
        language: sample(languages),
        image: faker.image.unsplash.people(300, 901),
        categoryIds: ['cat11'],
        imageAspectRatio: 300 / 901,
      }),
      factory.create('Post', {
        author: bobDerBaumeister,
        id: 'p13',
        language: sample(languages),
        categoryIds: ['cat13'],
      }),
      factory.create('Post', {
        author: jennyRostock,
        id: 'p14',
        language: sample(languages),
        image: faker.image.unsplash.objects(300, 200),
        categoryIds: ['cat14'],
        imageAspectRatio: 300 / 450,
      }),
      factory.create('Post', {
        author: huey,
        id: 'p15',
        language: sample(languages),
        categoryIds: ['cat15'],
      }),
    ])

    authenticatedUser = await louie.toJson()
    const mention1 =
      'Hey <a class="mention" data-mention-id="u3" href="/profile/u3">@jenny-rostock</a>, what\'s up?'
    const mention2 =
      'Hey <a class="mention" data-mention-id="u3" href="/profile/u3">@jenny-rostock</a>, here is another notification for you!'
    const hashtag1 =
      'See <a class="hashtag" data-hashtag-id="NaturphilosophieYoga" href="/?hashtag=NaturphilosophieYoga">#NaturphilosophieYoga</a>, it can really help you!'
    const hashtagAndMention1 =
      'The new physics of <a class="hashtag" data-hashtag-id="QuantenFlussTheorie" href="/?hashtag=QuantenFlussTheorie">#QuantenFlussTheorie</a> can explain <a class="hashtag" data-hashtag-id="QuantumGravity" href="/?hashtag=QuantumGravity">#QuantumGravity</a>! <a class="mention" data-mention-id="u1" href="/profile/u1">@peter-lustig</a> got that already. ;-)'
    const createPostMutation = gql`
      mutation(
        $id: ID
        $title: String!
        $content: String!
        $categoryIds: [ID]
        $imageAspectRatio: Float
      ) {
        CreatePost(
          id: $id
          title: $title
          content: $content
          categoryIds: $categoryIds
          imageAspectRatio: $imageAspectRatio
        ) {
          id
        }
      }
    `

    await Promise.all([
      mutate({
        mutation: createPostMutation,
        variables: {
          id: 'p2',
          title: `Nature Philosophy Yoga`,
          content: hashtag1,
          categoryIds: ['cat2'],
          imageAspectRatio: 300 / 200,
        },
      }),
      mutate({
        mutation: createPostMutation,
        variables: {
          id: 'p7',
          title: 'This is post #7',
          content: `${mention1} ${faker.lorem.paragraph()}`,
          categoryIds: ['cat7'],
          imageAspectRatio: 300 / 180,
        },
      }),
      mutate({
        mutation: createPostMutation,
        variables: {
          id: 'p8',
          image: faker.image.unsplash.nature(),
          title: `Quantum Flow Theory explains Quantum Gravity`,
          content: hashtagAndMention1,
          categoryIds: ['cat8'],
          imageAspectRatio: 300 / 900,
        },
      }),
      mutate({
        mutation: createPostMutation,
        variables: {
          id: 'p12',
          title: 'This is post #12',
          content: `${mention2} ${faker.lorem.paragraph()}`,
          categoryIds: ['cat12'],
          imageAspectRatio: 300 / 200,
        },
      }),
    ])
    const [p2, p7, p8, p12] = await Promise.all(
      ['p2', 'p7', 'p8', 'p12'].map(id => neode.find('Post', id)),
    )
    authenticatedUser = null

    authenticatedUser = await dewey.toJson()
    const mentionInComment1 =
      'I heard <a class="mention" data-mention-id="u3" href="/profile/u3">@jenny-rostock</a> has practiced it for 3 years now.'
    const mentionInComment2 =
      'Did <a class="mention" data-mention-id="u1" href="/profile/u1">@peter-lustig</a> tell you?'
    const createCommentMutation = gql`
      mutation($id: ID, $postId: ID!, $content: String!) {
        CreateComment(id: $id, postId: $postId, content: $content) {
          id
        }
      }
    `
    await Promise.all([
      mutate({
        mutation: createCommentMutation,
        variables: {
          id: 'c4',
          postId: 'p2',
          content: mentionInComment1,
        },
      }),
      mutate({
        mutation: createCommentMutation,
        variables: {
          id: 'c4-1',
          postId: 'p2',
          content: mentionInComment2,
        },
      }),
      mutate({
        mutation: createCommentMutation,
        variables: {
          postId: 'p14',
          content: faker.lorem.paragraph(),
        },
      }), // should send a notification
    ])
    authenticatedUser = null

    const comments = await Promise.all([
      factory.create('Comment', {
        author: jennyRostock,
        id: 'c1',
        postId: 'p1',
      }),
      factory.create('Comment', {
        author: huey,
        id: 'c2',
        postId: 'p1',
      }),
      factory.create('Comment', {
        author: louie,
        id: 'c3',
        postId: 'p3',
      }),
      factory.create('Comment', {
        author: jennyRostock,
        id: 'c5',
        postId: 'p3',
      }),
      factory.create('Comment', {
        author: peterLustig,
        id: 'c6',
        postId: 'p4',
      }),
      factory.create('Comment', {
        author: jennyRostock,
        id: 'c7',
        postId: 'p2',
      }),
      factory.create('Comment', {
        author: huey,
        id: 'c8',
        postId: 'p15',
      }),
      factory.create('Comment', {
        author: dewey,
        id: 'c9',
        postId: 'p15',
      }),
      factory.create('Comment', {
        author: louie,
        id: 'c10',
        postId: 'p15',
      }),
      factory.create('Comment', {
        author: jennyRostock,
        id: 'c11',
        postId: 'p15',
      }),
      factory.create('Comment', {
        author: jennyRostock,
        id: 'c12',
        postId: 'p15',
      }),
    ])
    const trollingComment = comments[0]

    await Promise.all([
      democracy.relateTo(p3, 'post'),
      democracy.relateTo(p11, 'post'),
      democracy.relateTo(p15, 'post'),
      democracy.relateTo(p7, 'post'),
      environment.relateTo(p1, 'post'),
      environment.relateTo(p5, 'post'),
      environment.relateTo(p9, 'post'),
      environment.relateTo(p13, 'post'),
      freedom.relateTo(p0, 'post'),
      freedom.relateTo(p4, 'post'),
      freedom.relateTo(p8, 'post'),
      freedom.relateTo(p12, 'post'),
      nature.relateTo(p2, 'post'),
      nature.relateTo(p6, 'post'),
      nature.relateTo(p10, 'post'),
      nature.relateTo(p14, 'post'),
      peterLustig.relateTo(p15, 'emoted', { emotion: 'surprised' }),
      bobDerBaumeister.relateTo(p15, 'emoted', { emotion: 'surprised' }),
      jennyRostock.relateTo(p15, 'emoted', { emotion: 'surprised' }),
      huey.relateTo(p15, 'emoted', { emotion: 'surprised' }),
      dewey.relateTo(p15, 'emoted', { emotion: 'surprised' }),
      louie.relateTo(p15, 'emoted', { emotion: 'surprised' }),
      dagobert.relateTo(p15, 'emoted', { emotion: 'surprised' }),
      bobDerBaumeister.relateTo(p14, 'emoted', { emotion: 'cry' }),
      jennyRostock.relateTo(p13, 'emoted', { emotion: 'angry' }),
      huey.relateTo(p12, 'emoted', { emotion: 'funny' }),
      dewey.relateTo(p11, 'emoted', { emotion: 'surprised' }),
      louie.relateTo(p10, 'emoted', { emotion: 'cry' }),
      dewey.relateTo(p9, 'emoted', { emotion: 'happy' }),
      huey.relateTo(p8, 'emoted', { emotion: 'angry' }),
      jennyRostock.relateTo(p7, 'emoted', { emotion: 'funny' }),
      bobDerBaumeister.relateTo(p6, 'emoted', { emotion: 'surprised' }),
      peterLustig.relateTo(p5, 'emoted', { emotion: 'cry' }),
      bobDerBaumeister.relateTo(p4, 'emoted', { emotion: 'happy' }),
      jennyRostock.relateTo(p3, 'emoted', { emotion: 'angry' }),
      huey.relateTo(p2, 'emoted', { emotion: 'funny' }),
      dewey.relateTo(p1, 'emoted', { emotion: 'surprised' }),
      louie.relateTo(p0, 'emoted', { emotion: 'cry' }),
    ])

    await Promise.all([
      peterLustig.relateTo(p1, 'shouted'),
      peterLustig.relateTo(p6, 'shouted'),
      bobDerBaumeister.relateTo(p0, 'shouted'),
      bobDerBaumeister.relateTo(p6, 'shouted'),
      jennyRostock.relateTo(p6, 'shouted'),
      jennyRostock.relateTo(p7, 'shouted'),
      huey.relateTo(p8, 'shouted'),
      huey.relateTo(p9, 'shouted'),
      dewey.relateTo(p10, 'shouted'),
      peterLustig.relateTo(p2, 'shouted'),
      peterLustig.relateTo(p6, 'shouted'),
      bobDerBaumeister.relateTo(p0, 'shouted'),
      bobDerBaumeister.relateTo(p6, 'shouted'),
      jennyRostock.relateTo(p6, 'shouted'),
      jennyRostock.relateTo(p7, 'shouted'),
      huey.relateTo(p8, 'shouted'),
      huey.relateTo(p9, 'shouted'),
      louie.relateTo(p10, 'shouted'),
    ])

    const reports = await Promise.all([
      factory.create('Report'),
      factory.create('Report'),
      factory.create('Report'),
      factory.create('Report'),
    ])
    const reportAgainstDagobert = reports[0]
    const reportAgainstTrollingPost = reports[1]
    const reportAgainstTrollingComment = reports[2]
    const reportAgainstDewey = reports[3]

    // report resource first time
    await Promise.all([
      reportAgainstDagobert.relateTo(jennyRostock, 'filed', {
        resourceId: 'u7',
        reasonCategory: 'discrimination_etc',
        reasonDescription: 'This user is harassing me with bigoted remarks!',
      }),
      reportAgainstDagobert.relateTo(dagobert, 'belongsTo'),
      reportAgainstTrollingPost.relateTo(jennyRostock, 'filed', {
        resourceId: 'p2',
        reasonCategory: 'doxing',
        reasonDescription: "This shouldn't be shown to anybody else! It's my private thing!",
      }),
      reportAgainstTrollingPost.relateTo(p2, 'belongsTo'),
      reportAgainstTrollingComment.relateTo(huey, 'filed', {
        resourceId: 'c1',
        reasonCategory: 'other',
        reasonDescription: 'This comment is bigoted',
      }),
      reportAgainstTrollingComment.relateTo(trollingComment, 'belongsTo'),
      reportAgainstDewey.relateTo(dagobert, 'filed', {
        resourceId: 'u5',
        reasonCategory: 'discrimination_etc',
        reasonDescription: 'This user is harassing me!',
      }),
      reportAgainstDewey.relateTo(dewey, 'belongsTo'),
    ])

    // report resource a second time
    await Promise.all([
      reportAgainstDagobert.relateTo(louie, 'filed', {
        resourceId: 'u7',
        reasonCategory: 'discrimination_etc',
        reasonDescription: 'this user is attacking me for who I am!',
      }),
      reportAgainstDagobert.relateTo(dagobert, 'belongsTo'),
      reportAgainstTrollingPost.relateTo(peterLustig, 'filed', {
        resourceId: 'p2',
        reasonCategory: 'discrimination_etc',
        reasonDescription: 'This post is bigoted',
      }),
      reportAgainstTrollingPost.relateTo(p2, 'belongsTo'),

      reportAgainstTrollingComment.relateTo(bobDerBaumeister, 'filed', {
        resourceId: 'c1',
        reasonCategory: 'pornographic_content_links',
        reasonDescription: 'This comment is porno!!!',
      }),
      reportAgainstTrollingComment.relateTo(trollingComment, 'belongsTo'),
    ])

    const disableVariables = {
      resourceId: 'undefined-resource',
      disable: true,
      closed: false,
    }

    // review resource first time
    await Promise.all([
      reportAgainstDagobert.relateTo(bobDerBaumeister, 'reviewed', {
        ...disableVariables,
        resourceId: 'u7',
      }),
      dagobert.update({ disabled: true, updatedAt: new Date().toISOString() }),
      reportAgainstTrollingPost.relateTo(peterLustig, 'reviewed', {
        ...disableVariables,
        resourceId: 'p2',
      }),
      p2.update({ disabled: true, updatedAt: new Date().toISOString() }),
      reportAgainstTrollingComment.relateTo(bobDerBaumeister, 'reviewed', {
        ...disableVariables,
        resourceId: 'c1',
      }),
      trollingComment.update({ disabled: true, updatedAt: new Date().toISOString() }),
    ])

    // second review of resource and close report
    await Promise.all([
      reportAgainstDagobert.relateTo(peterLustig, 'reviewed', {
        resourceId: 'u7',
        disable: false,
        closed: true,
      }),
      dagobert.update({ disabled: false, updatedAt: new Date().toISOString(), closed: true }),
      reportAgainstTrollingPost.relateTo(bobDerBaumeister, 'reviewed', {
        resourceId: 'p2',
        disable: true,
        closed: true,
      }),
      p2.update({ disabled: true, updatedAt: new Date().toISOString(), closed: true }),
      reportAgainstTrollingComment.relateTo(peterLustig, 'reviewed', {
        ...disableVariables,
        resourceId: 'c1',
        disable: true,
        closed: true,
      }),
      trollingComment.update({ disabled: true, updatedAt: new Date().toISOString(), closed: true }),
    ])

    await Promise.all(
      [...Array(30).keys()].map(i => {
        return factory.create('User')
      }),
    )

    await Promise.all(
      [...Array(30).keys()].map(() => {
        return factory.create('Post', {
          author: jennyRostock,
          image: faker.image.unsplash.objects(),
        })
      }),
    )

    await Promise.all(
      [...Array(6).keys()].map(() => {
        return factory.create('Comment', {
          author: jennyRostock,
          postId: 'p2',
        })
      }),
    )

    await Promise.all(
      [...Array(4).keys()].map(() => {
        return factory.create('Comment', {
          author: jennyRostock,
          postId: 'p15',
        })
      }),
    )

    await Promise.all(
      [...Array(2).keys()].map(() => {
        return factory.create('Comment', {
          author: jennyRostock,
          postId: 'p4',
        })
      }),
    )

    await Promise.all(
      [...Array(21).keys()].map(() => {
        return factory.create('Post', {
          author: peterLustig,
          image: faker.image.unsplash.buildings(),
        })
      }),
    )

    await Promise.all(
      [...Array(3).keys()].map(() => {
        return factory.create('Comment', {
          author: peterLustig,
          postId: 'p4',
        })
      }),
    )

    await Promise.all(
      [...Array(5).keys()].map(() => {
        return factory.create('Comment', {
          author: peterLustig,
          postId: 'p14',
        })
      }),
    )

    await Promise.all(
      [...Array(6).keys()].map(() => {
        return factory.create('Comment', {
          author: peterLustig,
          postId: 'p0',
        })
      }),
    )

    await Promise.all(
      [...Array(11).keys()].map(() => {
        return factory.create('Post', {
          author: dewey,
          image: faker.image.unsplash.food(),
        })
      }),
    )

    await Promise.all(
      [...Array(7).keys()].map(() => {
        return factory.create('Comment', {
          author: dewey,
          postId: 'p2',
        })
      }),
    )

    await Promise.all(
      [...Array(5).keys()].map(() => {
        return factory.create('Comment', {
          author: dewey,
          postId: 'p6',
        })
      }),
    )

    await Promise.all(
      [...Array(2).keys()].map(() => {
        return factory.create('Comment', {
          author: dewey,
          postId: 'p9',
        })
      }),
    )

    await Promise.all(
      [...Array(16).keys()].map(() => {
        return factory.create('Post', {
          author: louie,
          image: faker.image.unsplash.technology(),
        })
      }),
    )

    await Promise.all(
      [...Array(4).keys()].map(() => {
        return factory.create('Comment', {
          author: louie,
          postId: 'p1',
        })
      }),
    )

    await Promise.all(
      [...Array(8).keys()].map(() => {
        return factory.create('Comment', {
          author: louie,
          postId: 'p10',
        })
      }),
    )

    await Promise.all(
      [...Array(5).keys()].map(() => {
        return factory.create('Comment', {
          author: louie,
          postId: 'p13',
        })
      }),
    )

    await Promise.all(
      [...Array(45).keys()].map(() => {
        return factory.create('Post', {
          author: bobDerBaumeister,
          image: faker.image.unsplash.people(),
        })
      }),
    )

    await Promise.all(
      [...Array(2).keys()].map(() => {
        return factory.create('Comment', {
          author: bobDerBaumeister,
          postId: 'p2',
        })
      }),
    )

    await Promise.all(
      [...Array(3).keys()].map(() => {
        return factory.create('Comment', {
          author: bobDerBaumeister,
          postId: 'p12',
        })
      }),
    )

    await Promise.all(
      [...Array(7).keys()].map(() => {
        return factory.create('Comment', {
          author: bobDerBaumeister,
          postId: 'p13',
        })
      }),
    )

    await Promise.all(
      [...Array(8).keys()].map(() => {
        return factory.create('Post', {
          author: huey,
          image: faker.image.unsplash.nature(),
        })
      }),
    )

    await Promise.all(
      [...Array(6).keys()].map(() => {
        return factory.create('Comment', {
          author: huey,
          postId: 'p0',
        })
      }),
    )

    await Promise.all(
      [...Array(8).keys()].map(() => {
        return factory.create('Comment', {
          author: huey,
          postId: 'p13',
        })
      }),
    )

    await Promise.all(
      [...Array(9).keys()].map(() => {
        return factory.create('Comment', {
          author: huey,
          postId: 'p15',
        })
      }),
    )

    await factory.create('Donations')
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
