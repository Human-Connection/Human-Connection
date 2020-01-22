import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import StoryRouter from 'storybook-vue-router'
import UserAvatar from '~/components/_new/generic/UserAvatar/UserAvatar'
import helpers from '~/storybook/helpers'
import { user } from '~/components/UserTeaser/UserTeaser.story.js'

helpers.init()
const anonymousUser = {
  ...user,
  name: 'Anonymous',
  avatar: null,
}
const userWithoutAvatar = {
  ...user,
  avatar: null,
  name: 'Ana Paula Nunes Marques',
}
storiesOf('UserAvatar', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .addDecorator(StoryRouter())
  .add('with image', () => ({
    components: { UserAvatar },
    data: () => ({
      user,
    }),
    template: '<user-avatar :user="user" />',
  }))
  .add('without image, anonymous user', () => ({
    components: { UserAvatar },
    data: () => ({
      user: anonymousUser,
    }),
    template: '<user-avatar :user="user" />',
  }))
  .add('without image, user initials', () => ({
    components: { UserAvatar },
    data: () => ({
      user: userWithoutAvatar,
    }),
    template: '<user-avatar :user="user" />',
  }))
  .add('small', () => ({
    components: { UserAvatar },
    data: () => ({
      user,
    }),
    template: '<user-avatar :user="user" size="small"/>',
  }))
  .add('large', () => ({
    components: { UserAvatar },
    data: () => ({
      user,
    }),
    template: '<user-avatar :user="user" size="large"/>',
  }))
