import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'

import helpers from '~/storybook/helpers'
import FollowList from './FollowList.vue'

helpers.init()

const user = {
  name: 'Jenny Rostock',
  id: 'u3',
  followedByCount: 12,
  followedBy: helpers.fakeUser(7),
  followingCount: 28,
  following: helpers.fakeUser(7),
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
      template: `<div><follow-list :user="user" /><div style="margin: 1rem"></div><follow-list :user="user" type="followedBy" /></div>`,
    }
  })
  .add('with up to 7 connections', () => {
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
      template: `<div style="display: flex; flex-wrap: wrap;"><div style="margin: 8px;"><follow-list :user="user" @fetchAllConnections="fetchAllConnections"/></div><div style="margin: 8px;"><follow-list :user="user" type="followedBy" @fetchAllConnections="fetchAllConnections"/></div></div>`,
    }
  })

  .add('with all connections', () => {
    return {
      components: { FollowList },
      store: helpers.store,
      data() {
        return { user: allConnectionsUser }
      },
      template: `<div style="display: flex; flex-wrap: wrap;"><div style="margin: 8px;"><follow-list :user="user" /></div><div style="margin: 8px;"><follow-list :user="user" type="followedBy"/></div></div>`,
    }
  })
