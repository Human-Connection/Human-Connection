import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'

import helpers from '~/storybook/helpers'
import FollowList from './FollowList.vue'

helpers.init()

const sevenConnectionsUser = {
  name: 'Jenny Rostock',
  id: 'u3',
  followedByCount: 12,
  followedBy: [
    {
      id: '2877b626-bac0-43df-b2bf-4ee025ba38b2',
      name: 'Kristina Beahan',
      slug: 'kristina-beahan',
    },
    {
      id: '16b8838d-cc9f-4d30-8601-e4dea77d2f02',
      name: 'Rhonda Stokes',
      slug: 'rhonda-stokes',
    },
    {
      id: '47a9846a-87d4-43fa-bf81-51d21dc38ed3',
      name: 'Benny Lang',
      slug: 'benny-lang',
    },
    {
      id: 'd3d43b17-e7bb-4778-a373-798df58a9a5f',
      name: 'Ms. Rita Thompson',
      slug: 'ms-rita-thompson',
    },
    {
      id: '18a4827c-8b5f-4510-b6fe-09fe8688eed1',
      name: 'Arthur Johns',
      slug: 'arthur-johns',
    },
    {
      id: '45313bea-9152-4c8d-9c6e-1eca029979f8',
      name: 'Jeremiah Breitenberg',
      slug: 'jeremiah-breitenberg',
    },
    {
      id: 'cfaf1c25-f0ad-4bdf-82a3-e4d8d5e5093e',
      name: 'Dominic Weimann Jr.',
      slug: 'dominic-weimann-jr',
    },
  ],
}

const allConnectionsUser = {
  ...sevenConnectionsUser,
  followedBy: [
    ...sevenConnectionsUser.followedBy,
    {
      id: '9f305e7a-ae5a-4e22-8269-8b6899af674f',
      name: 'Hugh Harris Sr.',
      slug: 'hugh-harris-sr',
    },
    {
      id: '69dbad2b-5749-4697-9976-221992439086',
      name: 'Ashley Fisher',
      slug: 'ashley-fisher',
    },
    {
      id: 'eec8ee9e-ee4e-4b83-b655-a106eb857611',
      name: 'Devin Reynolds',
      slug: 'devin-reynolds',
    },
    {
      id: 'f638fad4-73c2-4bc9-ae4e-2e53035397e9',
      name: 'Sophia Jaskolski',
      slug: 'sophia-jaskolski',
    },
    {
      id: '61040fdf-da6a-489e-b79c-45f58d33386f',
      name: 'Rodolfo Lind',
      slug: 'rodolfo-lind',
    },
  ],
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
