import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import SearchableInput from './SearchableInput.vue'
import helpers from '~/storybook/helpers'

helpers.init()

export const searchResults = [
  {
    id: 'post-by-jenny',
    __typename: 'Post',
    slug: 'user-post-by-jenny',
    title: 'User Post by Jenny',
    value: 'User Post by Jenny',
    shoutedCount: 0,
    commentCount: 4,
    createdAt: '2019-11-13T03:03:16.155Z',
    author: {
      id: 'u3',
      name: 'Jenny Rostock',
      slug: 'jenny-rostock',
    },
  },
  {
    id: 'f48f00a0-c412-432f-8334-4276a4e15d1c',
    __typename: 'Post',
    slug: 'eum-quos-est-molestiae-enim-magni-consequuntur-sed-commodi-eos',
    title: 'Eum quos est molestiae enim magni consequuntur sed commodi eos.',
    value: 'Eum quos est molestiae enim magni consequuntur sed commodi eos.',
    shoutedCount: 0,
    commentCount: 0,
    createdAt: '2019-11-13T03:00:45.478Z',
    author: {
      id: 'u6',
      name: 'Louie',
      slug: 'louie',
    },
  },
  {
    id: 'p7',
    __typename: 'Post',
    slug: 'this-is-post-7',
    title: 'This is post #7',
    value: 'This is post #7',
    shoutedCount: 1,
    commentCount: 1,
    createdAt: '2019-11-13T03:00:23.098Z',
    author: {
      id: 'u6',
      name: 'Louie',
      slug: 'louie',
    },
  },
  {
    id: 'p12',
    __typename: 'Post',
    slug: 'this-is-post-12',
    title: 'This is post #12',
    value: 'This is post #12',
    shoutedCount: 0,
    commentCount: 12,
    createdAt: '2019-11-13T03:00:23.098Z',
    author: {
      id: 'u6',
      name: 'Louie',
      slug: 'louie',
    },
  },
  {
    id: 'u1',
    __typename: 'User',
    avatar:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/db/dbc9e03ebcc384b920c31542af2d27dd8eea9dc2_full.jpg',
    name: 'Peter Lustig',
    slug: 'peter-lustig',
  },
  {
    id: 'cdbca762-0632-4564-b646-415a0c42d8b8',
    __typename: 'User',
    avatar:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/db/dbc9e03ebcc384b920c31542af2d27dd8eea9dc2_full.jpg',
    name: 'Herbert Schultz',
    slug: 'herbert-schultz',
  },
  {
    id: 'u2',
    __typename: 'User',
    avatar:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/db/dbc9e03ebcc384b920c31542af2d27dd8eea9dc2_full.jpg',
    name: 'Bob der Baumeister',
    slug: 'bob-der-baumeister',
  },
  {
    id: '7b654f72-f4da-4315-8bed-39de0859754b',
    __typename: 'User',
    avatar:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/db/dbc9e03ebcc384b920c31542af2d27dd8eea9dc2_full.jpg',
    name: 'Tonya Mohr',
    slug: 'tonya-mohr',
  },
]

storiesOf('Search Field', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('test', () => ({
    components: { SearchableInput },
    store: helpers.store,
    data: () => ({
      searchResults,
    }),
    template: `
      <searchable-input :options="searchResults" />
    `,
  }))
