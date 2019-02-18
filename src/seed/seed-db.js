import { create, apolloClient, seedServerHost as host } from './factories'
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
      create('user', { id: 'u1', name: 'Peter Lustig',       role: 'admin',     badgeIds: ['b6'], email: 'admin@example.org' }),
      create('user', { id: 'u2', name: 'Bob der Baumeister', role: 'moderator', badgeIds: ['b5'], email: 'moderator@example.org' }),
      create('user', { id: 'u3', name: 'Jenny Rostock',      role: 'user',      badgeIds: ['b4'], email: 'user@example.org' }),
      create('user', { id: 'u4', name: 'Tick',               role: 'user',      badgeIds: ['b3'], email: 'tick@example.org' }),
      create('user', { id: 'u5', name: 'Trick',              role: 'user',      badgeIds: ['b2'], email: 'trick@example.org' }),
      create('user', { id: 'u6', name: 'Track',              role: 'user',      badgeIds: ['b1'], email: 'track@example.org' }),
      create('user', { id: 'u7', name: 'Dagobert', role: 'user', badgeIds: ['b1', 'b2'], blacklistedUserIds: ['u4', 'u5', 'u6'], email: 'dagobert@example.org' })
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
      create('post', { id: 'p0',  categoryIds: ['cat1'],  tagIds: ['t1', 't4'] }, { headers: headers[0]}),
      create('post', { id: 'p1',  categoryIds: ['cat2'],  tagIds: ['t2', 't3'] }, { headers: headers[1]}),
      create('post', { id: 'p2',  categoryIds: ['cat3'],  tagIds: ['t3', 't4'] }, { headers: headers[2]}),
      create('post', { id: 'p3',  categoryIds: ['cat4'],  tagIds: ['t4', 't2'] }, { headers: headers[3]}),
      create('post', { id: 'p4',  categoryIds: ['cat5'],  tagIds: ['t1', 't2'] }, { headers: headers[4]}),
      create('post', { id: 'p5',  categoryIds: ['cat6'],  tagIds: ['t2', 't4'] }, { headers: headers[5]}),
      create('post', { id: 'p6',  categoryIds: ['cat7'],  tagIds: ['t1', 't4'] }, { headers: headers[0]}),
      create('post', { id: 'p7',  categoryIds: ['cat8'],  tagIds: ['t2', 't3'] }, { headers: headers[1]}),
      create('post', { id: 'p8',  categoryIds: ['cat9'],  tagIds: ['t3', 't4'] }, { headers: headers[2]}),
      create('post', { id: 'p10', categoryIds: ['cat11'], tagIds: ['t4', 't2'] }, { headers: headers[3]}),
      create('post', { id: 'p11', categoryIds: ['cat12'], tagIds: ['t1', 't2'] }, { headers: headers[4]}),
      create('post', { id: 'p12', categoryIds: ['cat13'], tagIds: ['t2', 't4'] }, { headers: headers[5]}),
      create('post', { id: 'p13', categoryIds: ['cat14'], tagIds: ['t4', 't2'] }, { headers: headers[0]}),
      create('post', { id: 'p14', categoryIds: ['cat15'], tagIds: ['t1', 't2'] }, { headers: headers[1]}),
      create('post', { id: 'p15', categoryIds: ['cat16'], tagIds: ['t2', 't4'] }, { headers: headers[2]})
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
