import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import User from '~/components/User/User.vue'
import helpers from '~/storybook/helpers'

helpers.init()

const user = {
  id: 'u6',
  slug: 'louie',
  name: 'Louie',
  avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/designervzm/128.jpg',
  about:
    'Illum in et velit soluta voluptatem architecto consequuntur enim placeat. Eum excepturi est ratione rerum in voluptatum corporis. Illum consequatur minus. Modi incidunt velit.',
  disabled: false,
  deleted: false,
  locationName: null,
  location: null,
  createdAt: '2019-09-18T14:16:01.695Z',
  badges: [],
  badgesCount: 0,
  shoutedCount: 1,
  commentedCount: 2,
  contributionsCount: 5,
  followingCount: 1,
  following: [
    {
      id: 'u3',
      slug: 'jenny-rostock',
      name: 'Jenny Rostock',
      avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/bowbrick/128.jpg',
      disabled: false,
      deleted: false,
      followedByCount: 2,
      followedByCurrentUser: false,
      contributionsCount: 1,
      commentedCount: 3,
      badges: [
        {
          id: 'indiegogo_en_bear',
          icon: '/img/badges/indiegogo_en_bear.svg',
        },
      ],
      location: {
        name: 'Paris',
      },
    },
  ],
  followedByCount: 0,
  followedByCurrentUser: false,
  isBlocked: false,
  followedBy: [],
  socialMedia: [],
}

storiesOf('User', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('available user', () => ({
    components: { User },
    store: helpers.store,
    data: () => ({
      user,
    }),
    template: '<user :user="user" :trunc="35" :date-time="new Date()" />',
  }))
  .add('anonymous user', () => ({
    components: { User },
    store: helpers.store,
    data: () => ({
      user: null,
    }),
    template: '<user :user="user" :trunc="35" :date-time="new Date()" />',
  }))
