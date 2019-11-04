import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import StoryRouter from 'storybook-vue-router'
import AvatarMenu from '~/components/AvatarMenu/AvatarMenu'
import helpers from '~/storybook/helpers'

helpers.init()

storiesOf('AvatarMenu', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .addDecorator(StoryRouter())
  .add('dropdown', () => ({
    components: { AvatarMenu },
    store: helpers.store,
    template: '<avatar-menu placement="top" />',
  }))
