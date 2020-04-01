import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import { post } from '~/components/PostTeaser/PostTeaser.story.js'
import { user } from '~/components/UserTeaser/UserTeaser.story.js'
import helpers from '~/storybook/helpers'
import ReportList from './ReportList'
import DropdownFilter from '~/components/DropdownFilter/DropdownFilter'
import ReportsTable from '~/components/features/ReportsTable/ReportsTable'
helpers.init()

export const reports = [
  {
    __typename: 'Report',
    closed: false,
    createdAt: '2019-10-29T15:36:02.106Z',
    updatedAt: '2019-12-02T15:56:35.651Z',
    disable: false,
    filed: [
      {
        __typename: 'FILED',
        createdAt: '2019-10-02T15:56:35.676Z',
        reasonCategory: 'pornographic_content_links',
        reasonDescription: 'This comment is porno!!!',
        submitter: {
          ...user,
          name: 'Community moderator',
          id: 'community-moderator',
          slug: 'community-moderator',
        },
      },
    ],
    resource: {
      __typename: 'Comment',
      id: 'b6b38937-3efc-4d5e-b12c-549e4d6551a5',
      createdAt: '2019-10-29T15:38:25.184Z',
      updatedAt: '2019-10-30T15:38:25.184Z',
      disabled: false,
      deleted: false,
      content:
        '<p><a class="mention" href="/profile/u1" data-mention-id="u1" target="_blank">@peter-lustig</a> </p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Turpis egestas pretium aenean pharetra magna ac placerat. Tempor id eu nisl nunc mi ipsum faucibus vitae. Nibh praesent tristique magna sit amet purus gravida quis blandit. Magna eget est lorem ipsum dolor. In fermentum posuere urna nec. Eleifend donec pretium vulputate sapien nec sagittis aliquam. Augue interdum velit euismod in pellentesque. Id diam maecenas ultricies mi eget mauris pharetra. Donec pretium vulputate sapien nec. Dolor morbi non arcu risus quis varius quam quisque. Blandit turpis cursus in hac habitasse. Est ultricies integer quis auctor elit sed vulputate mi sit. Nunc consequat interdum varius sit amet mattis vulputate enim. Semper feugiat nibh sed pulvinar. Eget felis eget nunc lobortis mattis aliquam. Ultrices vitae auctor eu augue. Tellus molestie nunc non blandit massa enim nec dui. Pharetra massa massa ultricies mi quis hendrerit dolor. Nisl suscipit adipiscing bibendum est ultricies integer.</p>',
      contentExcerpt:
        '<p><a href="/profile/u1" target="_blank">@peter-lustig</a> </p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Turpis egestas pretium aenean pharetra …</p>',
      post,
      author: user,
    },
    reviewed: [
      {
        updatedAt: '2019-10-30T15:38:25.184Z',
        moderator: {
          __typename: 'User',
          ...user,
          name: 'Moderator',
          id: 'moderator',
          slug: 'moderator',
        },
      },
      {
        updatedAt: '2019-10-29T15:38:25.184Z',
        moderator: {
          __typename: 'User',
          ...user,
          name: 'Peter Lustig',
          id: 'u3',
          slug: 'peter-lustig',
        },
      },
    ],
  },
  {
    __typename: 'Report',
    closed: false,
    createdAt: '2019-10-31T15:36:02.106Z',
    updatedAt: '2019-12-03T15:56:35.651Z',
    disable: true,
    filed: [
      {
        __typename: 'FILED',
        createdAt: '2019-10-31T15:36:02.106Z',
        reasonCategory: 'discrimination_etc',
        reasonDescription: 'This post is bigoted',
        submitter: {
          ...user,
          name: 'Modertation team',
          id: 'moderation-team',
          slug: 'moderation-team',
        },
      },
    ],
    resource: {
      __typename: 'Post',
      author: {
        ...user,
        id: 'u7',
        name: 'Dagobert',
        slug: 'dagobert',
      },
      deleted: false,
      disabled: false,
      id: 'p2',
      slug: 'bigoted-post',
      title: "I'm a bigoted post!",
    },
    reviewed: [],
  },
  {
    __typename: 'Report',
    closed: true,
    createdAt: '2019-10-30T15:36:02.106Z',
    updatedAt: '2019-12-01T15:56:35.651Z',
    disable: true,
    filed: [
      {
        __typename: 'FILED',
        createdAt: '2019-10-30T15:36:02.106Z',
        reasonCategory: 'discrimination_etc',
        reasonDescription: 'this user is attacking me for who I am!',
        submitter: {
          ...user,
          name: 'Helpful user',
          id: 'helpful-user',
          slug: 'helpful-user',
        },
      },
    ],
    resource: {
      __typename: 'User',
      commentedCount: 0,
      contributionsCount: 0,
      deleted: false,
      disabled: true,
      followedByCount: 0,
      id: 'u5',
      name: 'Abusive user',
      slug: 'abusive-user',
    },
    reviewed: [
      {
        updatedAt: '2019-12-01T15:56:35.651Z',
        moderator: {
          __typename: 'User',
          ...user,
          name: 'Peter Lustig',
          id: 'u3',
          slug: 'peter-lustig',
        },
      },
      {
        updatedAt: '2019-11-30T15:56:35.651Z',
        moderator: {
          __typename: 'User',
          ...user,
          name: 'Moderator',
          id: 'moderator',
          slug: 'moderator',
        },
      },
    ],
  },
]
const unreviewedReports = reports.filter((report) => !report.reviewed)
const reviewedReports = reports.filter((report) => report.reviewed)
const closedReports = reports.filter((report) => report.closed)
const filterOptions = [
  { label: 'All', value: reports },
  { label: 'Unreviewed', value: unreviewedReports },
  { label: 'Reviewed', value: reviewedReports },
  { label: 'Closed', value: closedReports },
]

storiesOf('ReportList', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('with reports', () => ({
    components: { ReportList, DropdownFilter, ReportsTable },
    store: helpers.store,
    data: () => ({
      filterOptions,
      selected: filterOptions[0].label,
      reports,
    }),
    methods: {
      openModal: action('openModal'),
      filter: action('filter'),
    },
    template: `<base-card>
                <div class="reports-header">
                  <h3 class="title">Reports</h3>
                  <dropdown-filter @filter="filter" :filterOptions="filterOptions" :selected="selected" />
                </div>
                <reports-table :reports="reports" @confirm="openModal" />
              </base-card>`,
  }))
