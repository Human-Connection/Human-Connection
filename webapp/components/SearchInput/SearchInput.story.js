import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import SearchInput from './SearchInput.vue'
import helpers from '~/storybook/helpers'

helpers.init()

export const results = {
  posts: [
    {
      id: 'de100841-2336-4b01-a574-f1bd2c0b262a',
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
  ],
}

storiesOf('Search Input', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('test', () => ({
    components: { SearchInput },
    store: helpers.store,
    data: () => ({
      results: results.posts,
    }),
    template: `
      <search-input
        :results="results"
        :width="{ base: '100%', xs: '100%', md: '50%', xl: '33%' }"
      />
    `,
  }))
