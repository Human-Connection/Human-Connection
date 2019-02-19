import { create, relate, apolloClient, seedServerHost as host } from './factories'
import { authenticatedHeaders } from '../jest/helpers.js'
import gql from 'graphql-tag'
import asyncForEach from '../helpers/asyncForEach'
import seed from './data'

/* eslint-disable no-multi-spaces */
(async function () {
  try {

    await Promise.all([
      create('badge', { id: 'b1', key: 'indiegogo_en_racoon', type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_racoon.svg' }),
      create('badge', { id: 'b2', key: 'indiegogo_en_rabbit', type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_rabbit.svg' }),
      create('badge', { id: 'b3', key: 'indiegogo_en_wolf',   type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_wolf.svg' }),
      create('badge', { id: 'b4', key: 'indiegogo_en_bear',   type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_bear.svg' }),
      create('badge', { id: 'b5', key: 'indiegogo_en_turtle', type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_turtle.svg' }),
      create('badge', { id: 'b6', key: 'indiegogo_en_rhino',  type: 'crowdfunding', status: 'permanent', icon: '/img/badges/indiegogo_en_rhino.svg' })
    ])

    await Promise.all([
      create('user', { id: 'u1', name: 'Peter Lustig',       role: 'admin',     email: 'admin@example.org' }),
      create('user', { id: 'u2', name: 'Bob der Baumeister', role: 'moderator', email: 'moderator@example.org' }),
      create('user', { id: 'u3', name: 'Jenny Rostock',      role: 'user',      email: 'user@example.org' }),
      create('user', { id: 'u4', name: 'Tick',               role: 'user',      email: 'tick@example.org' }),
      create('user', { id: 'u5', name: 'Trick',              role: 'user',      email: 'trick@example.org' }),
      create('user', { id: 'u6', name: 'Track',              role: 'user',      email: 'track@example.org' }),
      create('user', { id: 'u7', name: 'Dagobert',           role: 'user',      email: 'dagobert@example.org' })
    ])

    await Promise.all([
      relate('user', 'Badges',      { from: 'b6', to: 'u1' }),
      relate('user', 'Badges',      { from: 'b5', to: 'u2' }),
      relate('user', 'Badges',      { from: 'b4', to: 'u3' }),
      relate('user', 'Badges',      { from: 'b3', to: 'u4' }),
      relate('user', 'Badges',      { from: 'b2', to: 'u5' }),
      relate('user', 'Badges',      { from: 'b1', to: 'u6' }),
      relate('user', 'Following',   { from: 'u1', to: 'u2' }),
      relate('user', 'Following',   { from: 'u2', to: 'u3' }),
      relate('user', 'Following',   { from: 'u3', to: 'u4' }),
      relate('user', 'Following',   { from: 'u4', to: 'u5' }),
      relate('user', 'Following',   { from: 'u5', to: 'u6' }),
      relate('user', 'Following',   { from: 'u6', to: 'u7' }),
      relate('user', 'Friends',     { from: 'u1', to: 'u2' }),
      relate('user', 'Friends',     { from: 'u1', to: 'u3' }),
      relate('user', 'Friends',     { from: 'u2', to: 'u3' }),
      relate('user', 'Blacklisted', { from: 'u7', to: 'u4' }),
      relate('user', 'Blacklisted', { from: 'u7', to: 'u5' }),
      relate('user', 'Blacklisted', { from: 'u7', to: 'u6' })
    ])

    const headers = await Promise.all([
     authenticatedHeaders({ email: 'admin@example.org',     password: '1234' }, host),
     authenticatedHeaders({ email: 'moderator@example.org', password: '1234' }, host),
     authenticatedHeaders({ email: 'user@example.org',      password: '1234' }, host),
     authenticatedHeaders({ email: 'tick@example.org',      password: '1234' }, host),
     authenticatedHeaders({ email: 'trick@example.org',     password: '1234' }, host),
     authenticatedHeaders({ email: 'track@example.org',     password: '1234' }, host),
    ])

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
      create('post', { id: 'p0',  tagIds: ['t1', 't4'] }, { headers: headers[0]}),
      create('post', { id: 'p1',  tagIds: ['t2', 't3'] }, { headers: headers[1]}),
      create('post', { id: 'p2',  tagIds: ['t3', 't4'] }, { headers: headers[2]}),
      create('post', { id: 'p3',  tagIds: ['t4', 't2'] }, { headers: headers[3]}),
      create('post', { id: 'p4',  tagIds: ['t1', 't2'] }, { headers: headers[4]}),
      create('post', { id: 'p5',  tagIds: ['t2', 't4'] }, { headers: headers[5]}),
      create('post', { id: 'p6',  tagIds: ['t1', 't4'] }, { headers: headers[0]}),
      create('post', { id: 'p7',  tagIds: ['t2', 't3'] }, { headers: headers[1]}),
      create('post', { id: 'p8',  tagIds: ['t3', 't4'] }, { headers: headers[2]}),
      create('post', { id: 'p9',  tagIds: ['t3', 't4'] }, { headers: headers[3]}),
      create('post', { id: 'p10', tagIds: ['t4', 't2'] }, { headers: headers[4]}),
      create('post', { id: 'p11', tagIds: ['t1', 't2'] }, { headers: headers[5]}),
      create('post', { id: 'p12', tagIds: ['t2', 't4'] }, { headers: headers[0]}),
      create('post', { id: 'p13', tagIds: ['t4', 't2'] }, { headers: headers[1]}),
      create('post', { id: 'p14', tagIds: ['t1', 't2'] }, { headers: headers[2]}),
      create('post', { id: 'p15', tagIds: ['t2', 't4'] }, { headers: headers[3]})
    ])

    await Promise.all([
      relate('post', 'Categories', { from: 'p0',  to: 'cat16' }),
      relate('post', 'Categories', { from: 'p1',  to: 'cat1' }),
      relate('post', 'Categories', { from: 'p2',  to: 'cat2' }),
      relate('post', 'Categories', { from: 'p3',  to: 'cat3' }),
      relate('post', 'Categories', { from: 'p4',  to: 'cat4' }),
      relate('post', 'Categories', { from: 'p5',  to: 'cat5' }),
      relate('post', 'Categories', { from: 'p6',  to: 'cat6' }),
      relate('post', 'Categories', { from: 'p7',  to: 'cat7' }),
      relate('post', 'Categories', { from: 'p8',  to: 'cat8' }),
      relate('post', 'Categories', { from: 'p9',  to: 'cat9' }),
      relate('post', 'Categories', { from: 'p10', to: 'cat10' }),
      relate('post', 'Categories', { from: 'p11', to: 'cat11' }),
      relate('post', 'Categories', { from: 'p12', to: 'cat12' }),
      relate('post', 'Categories', { from: 'p13', to: 'cat13' }),
      relate('post', 'Categories', { from: 'p14', to: 'cat14' }),
      relate('post', 'Categories', { from: 'p15', to: 'cat15' }),

      relate('post', 'Tags', { from: 'p0',  to: 't4' }),
      relate('post', 'Tags', { from: 'p1',  to: 't1' }),
      relate('post', 'Tags', { from: 'p2',  to: 't2' }),
      relate('post', 'Tags', { from: 'p3',  to: 't3' }),
      relate('post', 'Tags', { from: 'p4',  to: 't4' }),
      relate('post', 'Tags', { from: 'p5',  to: 't1' }),
      relate('post', 'Tags', { from: 'p6',  to: 't2' }),
      relate('post', 'Tags', { from: 'p7',  to: 't3' }),
      relate('post', 'Tags', { from: 'p8',  to: 't4' }),
      relate('post', 'Tags', { from: 'p9',  to: 't1' }),
      relate('post', 'Tags', { from: 'p10', to: 't2' }),
      relate('post', 'Tags', { from: 'p11', to: 't3' }),
      relate('post', 'Tags', { from: 'p12', to: 't4' }),
      relate('post', 'Tags', { from: 'p13', to: 't1' }),
      relate('post', 'Tags', { from: 'p14', to: 't2' }),
      relate('post', 'Tags', { from: 'p15', to: 't3' }),
    ])
    await Promise.all([
      relate('user', 'Shouted', { from: 'u1', to: 'p2' }),
      relate('user', 'Shouted', { from: 'u1', to: 'p3' }),
      relate('user', 'Shouted', { from: 'u2', to: 'p1' }),
      relate('user', 'Shouted', { from: 'u3', to: 'p1' }),
      relate('user', 'Shouted', { from: 'u3', to: 'p4' }),
      relate('user', 'Shouted', { from: 'u4', to: 'p1' })
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
/* eslint-enable no-multi-spaces */
