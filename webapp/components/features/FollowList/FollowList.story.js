import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'

import helpers from '~/storybook/helpers'
import FollowList from './FollowList.vue'

import fuzzyFilterUser from './FollowList.story.json'

helpers.init()

const user = {
  name: 'Jenny Rostock',
  id: 'u3',
  followedByCount: 12,
  followedBy: helpers.fakeUser(7),
  followingCount: 28,
  following: helpers.fakeUser(7),
}

const lessThanSevenUser = {
  ...user,
  followedByCount: 3,
  followedBy: user.followedBy.slice(0, 3),
  followingCount: 3,
  following: user.following.slice(0, 3),
}

const allConnectionsUser = {
  ...user,
  followedBy: [...user.followedBy, ...helpers.fakeUser(5)],
  following: [...user.following, ...helpers.fakeUser(21)],
}

const noConnectionsUser = {
  ...user,
  followedBy: [],
  followedByCount: 0,
  following: [],
  followingCount: 0,
}

storiesOf('FollowList', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('without connections', () => {
    return {
      components: { FollowList },
      store: helpers.store,
      data() {
        return { user: noConnectionsUser }
      },
      template: '<follow-list :user="user" type="following" />',
    }
  })
  .add('with all connections loaded', () => {
    return {
      components: { FollowList },
      store: helpers.store,
      data() {
        return { user: lessThanSevenUser }
      },

      template: '<follow-list :user="user"/>',
    }
  })

  .add('with more connections loadable', () => {
    return {
      components: { FollowList },
      store: helpers.store,
      data() {
        return { user: { ...user } }
      },
      methods: {
        fetchAllConnections(type) {
          this.user[type] = allConnectionsUser[type]
          action('fetchAllConnections')(type, this.user)
        },
      },
      template: '<follow-list :user="user" @fetchAllConnections="fetchAllConnections"/>',
    }
  })
  .add('with 1000 connections loaded', () => {
    return {
      components: { FollowList },
      store: helpers.store,
      data() {
        return {
          user: {
            ...user,
            followedByCount: 1000,
            followingCount: 1000,
            followedBy: helpers.fakeUser(1000),
            following: helpers.fakeUser(1000),
          },
        }
      },
      template: '<follow-list :user="user" />',
    }
  })
  .add('Fuzzy Filter', () => {
    return {
      components: { FollowList },
      store: helpers.store,
      data() {
        return { user: fuzzyFilterUser }
      },
      template: '<follow-list :user="user" />',
    }
  })
