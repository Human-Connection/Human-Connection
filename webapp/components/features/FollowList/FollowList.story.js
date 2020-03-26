import Vue from 'vue'
import faker from 'faker'
import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import apolloStorybookDecorator from 'apollo-storybook-vue'

import helpers from '~/storybook/helpers'
import FollowList from './FollowList.vue'

helpers.init()

const fakeUser = (n) => {
  return new Array(n || 1).fill(0).map(() => {
    const name = faker.name.findName()
    return {
      id: faker.random.uuid(),
      name,
      slug: faker.helpers.slugify(name),
    }
  })
}

const sevenConnectionsUser = {
  name: 'Jenny Rostock',
  id: 'u3',
  followedByCount: 12,
  followedBy: fakeUser(7),
}

const allConnectionsUser = {
  ...sevenConnectionsUser,
  followedBy: [...sevenConnectionsUser.followedBy, ...fakeUser(5)],
}

const mocks = {
  Query: () => ({
    User: () => [allConnectionsUser],
  }),
}
const typeDefs = `
  type User {
    followedByCount: Int
    followedBy(offset: Int): [User] 
    name: String
    slug: String
    id: String
  }
  
  type Query {
    User(id: ID!): [User]
  }
  schema {
    query: Query
  }
`

storiesOf('FollowList', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .addDecorator(
    apolloStorybookDecorator({
      mocks,
      typeDefs,
      Vue,
    }),
  )
  .add('without connections', () => {
    const user = {
      ...sevenConnectionsUser,
      followedBy: [],
      followedByCount: 0,
    }
    return {
      components: { FollowList },
      store: helpers.store,
      data() {
        return { user }
      },
      template: `<follow-list :user="user" type="followedBy" />`,
    }
  })
  .add('with up to 7 connections', () => {
    const user = sevenConnectionsUser
    return {
      components: { FollowList },
      store: helpers.store,
      data() {
        return {
          user,
        }
      },
      template: `<follow-list :user="user" type="followedBy" />`,
    }
  })

  .add('with more than 7 connections', () => {
    const user = allConnectionsUser
    return {
      components: { FollowList },
      store: helpers.store,
      data() {
        return {
          user,
        }
      },
      template: `<follow-list :user="user" type="followedBy" />`,
    }
  })
