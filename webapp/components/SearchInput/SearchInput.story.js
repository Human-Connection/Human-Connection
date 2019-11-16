import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import SearchInput from './SearchInput.vue'
import helpers from '~/storybook/helpers'

helpers.init()

export const results = [
    {
	heading: 'Contributions'
    },
  {
    id: 'de100841-2336-4b01-a574-f1bd2c0b262a',
    searchType: 'Contributions',
    slug: 'user-post-by-jenny',
    label: 'User Post by Jenny',
    value: 'User Post by Jenny',
    shoutedCount: 0,
    createdAt: '2019-11-13T03:03:16.155Z',
    author: {
      id: 'u3',
      name: 'Jenny Rostock',
      slug: 'jenny-rostock',
    },
  },
  {
    id: 'f48f00a0-c412-432f-8334-4276a4e15d1c',
    searchType: 'Contributions',
    slug: 'eum-quos-est-molestiae-enim-magni-consequuntur-sed-commodi-eos',
    label: 'Eum quos est molestiae enim magni consequuntur sed commodi eos.',
    value: 'Eum quos est molestiae enim magni consequuntur sed commodi eos.',
    shoutedCount: 0,
    createdAt: '2019-11-13T03:00:45.478Z',
    author: {
      id: 'u6',
      name: 'Louie',
      slug: 'louie',
    },
  },
  {
    id: 'p7',
    searchType: 'Contributions',
    slug: 'this-is-post-7',
    label: 'This is post #7',
    value: 'This is post #7',
    shoutedCount: 1,
    createdAt: '2019-11-13T03:00:23.098Z',
    author: {
      id: 'u6',
      name: 'Louie',
      slug: 'louie',
    },
  },
  {
    id: 'p12',
    searchType: 'Contributions',
    slug: 'this-is-post-12',
    label: 'This is post #12',
    value: 'This is post #12',
    shoutedCount: 0,
    createdAt: '2019-11-13T03:00:23.098Z',
    author: {
      id: 'u6',
      name: 'Louie',
      slug: 'louie',
    },
  },
    {
	heading: 'Users'
    },
  {
    id: 'u1',
    searchType: 'Users',
    avatar:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/db/dbc9e03ebcc384b920c31542af2d27dd8eea9dc2_full.jpg',
    name: 'Peter Lustig',
    label: 'Peter Lustig',
    slug: 'peter-lustig',
  },
  {
    id: 'cdbca762-0632-4564-b646-415a0c42d8b8',
    searchType: 'Users',
    avatar:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/db/dbc9e03ebcc384b920c31542af2d27dd8eea9dc2_full.jpg',
    name: 'Herbert Schultz',
    label: 'Herbert Schultz',
    slug: 'herbert-schultz',
  },
  {
    id: 'u2',
    searchType: 'Users',
    avatar:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/db/dbc9e03ebcc384b920c31542af2d27dd8eea9dc2_full.jpg',
    name: 'Bob der Baumeister',
    label: 'Bob der Baumeister',
    slug: 'bob-der-baumeister',
  },
  {
    id: '7b654f72-f4da-4315-8bed-39de0859754b',
    searchType: 'Users',
    avatar:
      'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/db/dbc9e03ebcc384b920c31542af2d27dd8eea9dc2_full.jpg',
    name: 'Tonya Mohr',
    label: 'Tonya Mohr',
    slug: 'tonya-mohr',
  },
]

storiesOf('Search Input', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('test', () => ({
    components: { SearchInput },
    store: helpers.store,
    data: () => ({
      results: results,
    }),
    template: `
      <search-input
        :results="results"
        :width="{ base: '100%', xs: '100%', md: '50%', xl: '33%' }"
      />
    `,
  }))
