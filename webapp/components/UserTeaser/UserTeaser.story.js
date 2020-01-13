import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import UserTeaser from '~/components/UserTeaser/UserTeaser.vue'
import helpers from '~/storybook/helpers'

helpers.init()

export const user = {
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

storiesOf('UserTeaser', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('available', () => ({
    components: { UserTeaser },
    store: helpers.store,
    data: () => ({
      user,
    }),
    template: '<user-teaser :user="user" :trunc="35" :date-time="new Date()" />',
  }))
  .add('has edited something', () => ({
    components: { UserTeaser },
    store: helpers.store,
    data: () => ({
      user,
    }),
    template: `
    <user-teaser :user="user" :trunc="35" :date-time="new Date()">
      <template v-slot:dateTime>
        - HEY! I'm edited
      </template>
    </user>
    `,
  }))
  .add('anonymous', () => ({
    components: { UserTeaser },
    store: helpers.store,
    data: () => ({
      user: null,
    }),
    template: '<user-teaser :user="user" :trunc="35" :date-time="new Date()" />',
  }))
