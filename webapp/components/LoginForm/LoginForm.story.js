import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import helpers from '~/storybook/helpers'
import Vue from 'vue'

import LoginForm from './LoginForm.vue'

helpers.init()

storiesOf('LoginForm', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('LoginForm', () => ({
    components: { LoginForm },
    data: () => ({}),
    store: helpers.store,
    template: `<login-form />`,
  }))
