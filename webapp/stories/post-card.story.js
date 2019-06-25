import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import HcPostCard from '~/components/PostCard'
import helpers from './helpers'

helpers.init()

const post = {
  id: 'd23a4265-f5f7-4e17-9f86-85f714b4b9f8',
  title: 'Very nice Post Title',
  contentExcerpt: '<p>My post content</p>',
  createdAt: '2019-06-24T22:08:59.304Z',
  disabled: false,
  deleted: false,
  slug: 'very-nice-post-title',
  image: null,
  author: {
    id: 'u3',
    avatar: '/uploads/1561386235196-Fleckenzwerg-Sabberlatzchen',
    slug: 'jenny-rostock',
    name: 'Rainer Unsinn',
    disabled: false,
    deleted: false,
    contributionsCount: 25,
    shoutedCount: 5,
    commentsCount: 39,
    followedByCount: 2,
    followedByCurrentUser: true,
    location: null,
    badges: [
      {
        id: 'b4',
        key: 'indiegogo_en_bear',
        icon: '/img/badges/indiegogo_en_bear.svg',
        __typename: 'Badge',
      },
    ],
    __typename: 'User',
  },
  commentsCount: 12,
  categories: [],
  shoutedCount: 421,
  __typename: 'Post',
}

storiesOf('Post Card', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('without image', () => ({
    components: { HcPostCard },
    store: helpers.store,
    data: () => ({
      post,
    }),
    template: `
      <hc-post-card
        :post="post"
        :width="{ base: '100%', xs: '100%', md: '50%', xl: '33%' }"
      />
    `,
  }))
  .add('with image', () => ({
    components: { HcPostCard },
    store: helpers.store,
    data: () => ({
      post: {
        ...post,
        image: 'https://unsplash.com/photos/R4y_E5ZQDPg/download',
      },
    }),
    template: `
      <hc-post-card
        :post="post"
        :width="{ base: '100%', xs: '100%', md: '50%', xl: '33%' }"
      />
    `,
  }))
