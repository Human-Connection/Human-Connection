import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import NotificationsTable from '~/components/NotificationsTable/NotificationsTable'
import helpers from '~/storybook/helpers'
import { post } from '~/components/PostTeaser/PostTeaser.story.js'
import { user } from '~/components/UserTeaser/UserTeaser.story.js'

helpers.init()
export const notifications = [
  {
    read: true,
    reason: 'mentioned_in_post',
    createdAt: '2019-10-29T15:36:02.106Z',
    from: {
      __typename: 'Post',
      ...post,
    },
    __typename: 'NOTIFIED',
    index: 9,
  },
  {
    read: false,
    reason: 'commented_on_post',
    createdAt: '2019-10-29T15:38:25.199Z',
    from: {
      __typename: 'Comment',
      id: 'b6b38937-3efc-4d5e-b12c-549e4d6551a5',
      createdAt: '2019-10-29T15:38:25.184Z',
      updatedAt: '2019-10-29T15:38:25.184Z',
      disabled: false,
      deleted: false,
      content:
        '<p><a class="mention" href="/profile/u1" data-mention-id="u1" target="_blank">@peter-lustig</a> </p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Turpis egestas pretium aenean pharetra magna ac placerat. Tempor id eu nisl nunc mi ipsum faucibus vitae. Nibh praesent tristique magna sit amet purus gravida quis blandit. Magna eget est lorem ipsum dolor. In fermentum posuere urna nec. Eleifend donec pretium vulputate sapien nec sagittis aliquam. Augue interdum velit euismod in pellentesque. Id diam maecenas ultricies mi eget mauris pharetra. Donec pretium vulputate sapien nec. Dolor morbi non arcu risus quis varius quam quisque. Blandit turpis cursus in hac habitasse. Est ultricies integer quis auctor elit sed vulputate mi sit. Nunc consequat interdum varius sit amet mattis vulputate enim. Semper feugiat nibh sed pulvinar. Eget felis eget nunc lobortis mattis aliquam. Ultrices vitae auctor eu augue. Tellus molestie nunc non blandit massa enim nec dui. Pharetra massa massa ultricies mi quis hendrerit dolor. Nisl suscipit adipiscing bibendum est ultricies integer.</p>',
      contentExcerpt:
        '<p><a href="/profile/u1" target="_blank">@peter-lustig</a> </p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Turpis egestas pretium aenean pharetra …</p>',
      ...post,
      author: user,
    },
    __typename: 'NOTIFIED',
    index: 1,
  },
  {
    read: false,
    reason: 'mentioned_in_comment',
    createdAt: '2019-10-29T15:38:13.422Z',
    from: {
      __typename: 'Comment',
      id: 'b91f4d4d-b178-4e42-9764-7fbcbf097f4c',
      createdAt: '2019-10-29T15:38:13.41Z',
      updatedAt: '2019-10-29T15:38:13.41Z',
      disabled: false,
      deleted: false,
      content:
        '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Turpis egestas pretium aenean pharetra magna ac placerat. Tempor id eu nisl nunc mi ipsum faucibus vitae. Nibh praesent tristique magna sit amet purus gravida quis blandit. Magna eget est lorem ipsum dolor. In fermentum posuere urna nec. Eleifend donec pretium vulputate sapien nec sagittis aliquam. Augue interdum velit euismod in pellentesque. Id diam maecenas ultricies mi eget mauris pharetra. Donec pretium vulputate sapien nec. Dolor morbi non arcu risus quis varius quam quisque. Blandit turpis cursus in hac habitasse. Est ultricies integer quis auctor elit sed vulputate mi sit. Nunc consequat interdum varius sit amet mattis vulputate enim. Semper feugiat nibh sed pulvinar. Eget felis eget nunc lobortis mattis aliquam. Ultrices vitae auctor eu augue. Tellus molestie nunc non blandit massa enim nec dui. Pharetra massa massa ultricies mi quis hendrerit dolor. Nisl suscipit adipiscing bibendum est ultricies integer.</p><p><a class="mention" href="/profile/u1" data-mention-id="u1" target="_blank">@peter-lustig</a> </p><p></p>',
      contentExcerpt:
        '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Turpis egestas pretium aenean pharetra magna ac …</p>',
      ...post,
      author: user,
    },
    __typename: 'NOTIFIED',
    index: 2,
  },
]
storiesOf('NotificationsTable', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('with notifications', () => ({
    components: { NotificationsTable },
    store: helpers.store,
    data: () => ({
      notifications,
    }),
    methods: {
      markNotificationAsRead: action('markNotificationAsRead'),
    },
    template: `<notifications-table
                @markNotificationAsRead="markNotificationAsRead"
                :notifications="notifications"
              />`,
  }))
  .add('without notifications', () => ({
    components: { NotificationsTable },
    store: helpers.store,
    template: `<notifications-table />`,
  }))
