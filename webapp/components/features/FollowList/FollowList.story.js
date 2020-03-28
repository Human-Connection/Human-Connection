import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'

import helpers from '~/storybook/helpers'
import FollowList from './FollowList.vue'

helpers.init()

const sevenConnectionsUser = {
  name: 'Jenny Rostock',
  id: 'u3',
  followedByCount: 12,
  followedBy: helpers.fakeUser(7),
}

const allConnectionsUser = {
  ...sevenConnectionsUser,
  followedBy: [...sevenConnectionsUser.followedBy, ...helpers.fakeUser(5)],
}

storiesOf('FollowList', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
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
      methods: {
        fetchAllConnections(type) {
          this.user = allConnectionsUser
          action('fetchAllConnections')(type, this.user)
        },
      },
      template: `<follow-list :user="user" type="followedBy" @fetchAllConnections="fetchAllConnections"/>`,
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
