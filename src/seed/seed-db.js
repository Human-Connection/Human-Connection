import { create, apolloClient, seedServerHost as host } from './factories'
import { authenticatedHeaders } from '../jest/helpers.js'
import gql from 'graphql-tag'
import asyncForEach from '../helpers/asyncForEach'
import seed from './data'

(async function () {
  // prefer factories
  try {
    await Promise.all([
      create('user', { id: 'u1', name: 'Peter Lustig',       role: 'admin',     email: 'admin@example.org', password: '1234' }),
      create('user', { id: 'u2', name: 'Bob der Baumeister', role: 'moderator', email: 'moderator@example.org' }),
      create('user', { id: 'u3', name: 'Jenny Rostock',      role: 'user',      email: 'user@example.org' }),
      create('user', { id: 'u4', name: 'Angie Banjie',       role: 'user',      email: 'angie@example.org' })
    ])

    const asAdmin = await authenticatedHeaders({
      email: 'admin@example.org',
      password: '1234'
    }, host)
    const asModerator = await authenticatedHeaders({
      email: 'moderator@example.org',
      password: '1234'
    }, host)
    const asUser = await authenticatedHeaders({
      email: 'user@example.org',
      password: '1234'
    }, host)

    await Promise.all([
      create('category', { id: 'cat1',  name: 'Just For Fun',                 slug: 'justforfun',                 icon: 'smile' }),
      create('category', { id: 'cat2',  name: 'Happyness & Values',           slug: 'happyness-values',           icon: 'heart-o' }),
      create('category', { id: 'cat3',  name: 'Health & Wellbeing',           slug: 'health-wellbeing',           icon: 'medkit' }),
      create('category', { id: 'cat4',  name: 'Environment & Nature',         slug: 'environment-nature',         icon: 'tree' }),
      create('category', { id: 'cat5',  name: 'Animal Protection',            slug: 'animalprotection',           icon: 'paw' }),
      create('category', { id: 'cat6',  name: 'Humanrights Justice',          slug: 'humanrights-justice',        icon: 'balance-scale' }),
      create('category', { id: 'cat7',  name: 'Education & Sciences',         slug: 'education-sciences',         icon: 'graduation-cap' }),
      create('category', { id: 'cat8',  name: 'Cooperation & Development',    slug: 'cooperation-development',    icon: 'users' }),
      create('category', { id: 'cat9',  name: 'Democracy & Politics',         slug: 'democracy-politics',         icon: 'university' }),
      create('category', { id: 'cat10', name: 'Economy & Finances',           slug: 'economy-finances',           icon: 'money' }),
      create('category', { id: 'cat11', name: 'Energy & Technology',          slug: 'energy-technology',          icon: 'flash' }),
      create('category', { id: 'cat12', name: 'IT, Internet & Data Privacy',  slug: 'it-internet-dataprivacy',    icon: 'mouse-pointer' }),
      create('category', { id: 'cat13', name: 'Art, Curlure & Sport',         slug: 'art-culture-sport',          icon: 'paint-brush' }),
      create('category', { id: 'cat14', name: 'Freedom of Speech',            slug: 'freedomofspeech',            icon: 'bullhorn' }),
      create('category', { id: 'cat15', name: 'Consumption & Sustainability', slug: 'consumption-sustainability', icon: 'shopping-cart' }),
      create('category', { id: 'cat16', name: 'Global Peace & Nonviolence',   slug: 'globalpeace-nonviolence',    icon: 'angellist' })
    ])

    await Promise.all([
      create('tag', { id: 't1', name: 'Umwelt' }),
      create('tag', { id: 't2', name: 'Naturschutz' }),
      create('tag', { id: 't3', name: 'Demokratie' }),
      create('tag', { id: 't4', name: 'Freiheit' })
    ])

    await Promise.all([
      create('badge', { id: 'b1', key: 'indiegogo_en_racoon', type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_racoon.svg' }),
      create('badge', { id: 'b2', key: 'indiegogo_en_rabbit', type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_rabbit.svg' }),
      create('badge', { id: 'b3', key: 'indiegogo_en_wolf',   type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_wolf.svg' }),
      create('badge', { id: 'b4', key: 'indiegogo_en_bear',   type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_bear.svg' }),
      create('badge', { id: 'b5', key: 'indiegogo_en_turtle', type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_turtle.svg' }),
      create('badge', { id: 'b6', key: 'indiegogo_en_rhino',  type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_rhino.svg' })
    ])

    await Promise.all([
      create('post', { id: 'p0',  categoryIds: ['cat1'],  tagIds: ['t1', 't4'] }, { headers: asAdmin }),
      create('post', { id: 'p1',  categoryIds: ['cat2'],  tagIds: ['t2', 't3'] }, { headers: asModerator }),
      create('post', { id: 'p2',  categoryIds: ['cat3'],  tagIds: ['t3', 't4'] }, { headers: asUser }),
      create('post', { id: 'p3',  categoryIds: ['cat4'],  tagIds: ['t4', 't2'] }, { headers: asAdmin }),
      create('post', { id: 'p4',  categoryIds: ['cat5'],  tagIds: ['t1', 't2'] }, { headers: asModerator }),
      create('post', { id: 'p5',  categoryIds: ['cat6'],  tagIds: ['t2', 't4'] }, { headers: asUser }),
      create('post', { id: 'p6',  categoryIds: ['cat7'],  tagIds: ['t1', 't4'] }, { headers: asAdmin }),
      create('post', { id: 'p7',  categoryIds: ['cat8'],  tagIds: ['t2', 't3'] }, { headers: asModerator }),
      create('post', { id: 'p8',  categoryIds: ['cat9'],  tagIds: ['t3', 't4'] }, { headers: asUser }),
      create('post', { id: 'p10', categoryIds: ['cat11'], tagIds: ['t4', 't2'] }, { headers: asAdmin }),
      create('post', { id: 'p11', categoryIds: ['cat12'], tagIds: ['t1', 't2'] }, { headers: asModerator }),
      create('post', { id: 'p12', categoryIds: ['cat13'], tagIds: ['t2', 't4'] }, { headers: asUser }),
      create('post', { id: 'p13', categoryIds: ['cat14'], tagIds: ['t4', 't2'] }, { headers: asAdmin }),
      create('post', { id: 'p14', categoryIds: ['cat15'], tagIds: ['t1', 't2'] }, { headers: asModerator }),
      create('post', { id: 'p15', categoryIds: ['cat16'], tagIds: ['t2', 't4'] }, { headers: asUser })
    ])
  } catch (err) {
    /* eslint-disable-next-line no-console */
    console.error(err)
    process.exit(1)
  }

  let data = {}
  // legacy seeds
  await asyncForEach(Object.keys(seed), async key => {
    const mutations = seed[key]
    try {
      const res = await apolloClient
        .mutate({
          mutation: gql(mutations(data))
        })
      data[key] = Object.assign(data[key] || {}, res.data)
    } catch (err) {
      /* eslint-disable-next-line no-console */
      console.error(err)
      process.exit(1)
    }
  })
  /* eslint-disable-next-line no-console */
  console.log('Seeded Data...')
})()
