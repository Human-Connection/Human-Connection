import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import FiledReportsTable from '~/components/features/FiledReportsTable/FiledReportsTable'
import helpers from '~/storybook/helpers'

helpers.init()

const filedReports = [
  {
    reasonDescription: 'This comments glorifies inhumanity',
    reasonCategory: 'glorific_trivia_of_cruel_inhuman_acts',
    resource: {
      __typename: 'Comment',
      id: 'd79cf548-6762-4cd7-bca4-fd5f043c380e',
      createdAt: '2020-02-10T15:56:29.144Z',
      updatedAt: '2020-02-10T15:56:29.144Z',
      disabled: false,
      deleted: false,
      content: 'Culpa adipisci id quo modi distinctio.',
      contentExcerpt: 'Culpa adipisci id quo modi distinctio.',
    },
    __typename: 'FiledReport',
  },
  {
    reasonDescription: 'This user is harassing me with bigoted remarks!',
    reasonCategory: 'discrimination_etc',
    resource: {
      __typename: 'User',
      id: 'u7',
      slug: 'dagobert',
      name: 'Dagobert',
      avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/marcoramires/128.jpg',
      disabled: false,
      deleted: false,
    },
    __typename: 'FiledReport',
  },
  {
    reasonDescription: "This shouldn't be shown to anybody else! It's my private thing!",
    reasonCategory: 'doxing',
    resource: {
      __typename: 'Post',
      id: 'p2',
      title: 'Nature Philosophy Yoga',
      content:
        'See <a class="hashtag" data-hashtag-id="NaturphilosophieYoga" href="/?hashtag=NaturphilosophieYoga" target="_blank">#NaturphilosophieYoga</a>, it can really help you!',
      contentExcerpt:
        'See <a href="/?hashtag=NaturphilosophieYoga" target="_blank">#NaturphilosophieYoga</a>, it can really help you!',
      createdAt: '2020-02-10T15:56:16.894Z',
      updatedAt: '2020-02-10T15:56:16.894Z',
      disabled: false,
      deleted: false,
      slug: 'nature-philosophy-yoga',
      image: null,
      language: null,
      imageBlurred: null,
      author: {
        id: 'u6',
        slug: 'louie',
        name: 'Louie',
        avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/leemunroe/128.jpg',
        disabled: false,
        deleted: false,
        __typename: 'User',
      },
      pinnedAt: null,
      imageAspectRatio: 1.5,
      pinned: null,
    },
    __typename: 'FiledReport',
  },
]

storiesOf('FiledReportsTable', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('without filed reports', () => ({
    components: { FiledReportsTable },
    store: helpers.store,
    template: '<filed-reports-table />',
  }))
  .add('with reported posts, comments and users', () => ({
    components: { FiledReportsTable },
    store: helpers.store,
    data: () => ({ filedReports }),
    template: '<filed-reports-table :filed-reports="filedReports" />',
  }))
