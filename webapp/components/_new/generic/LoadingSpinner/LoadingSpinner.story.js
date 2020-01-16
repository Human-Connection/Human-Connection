import { storiesOf } from '@storybook/vue'
import helpers from '~/storybook/helpers'
import LoadingSpinner from './LoadingSpinner.vue'

storiesOf('Generic/LoadingSpinner', module)
  .addDecorator(helpers.layout)

  .add('default', () => ({
    components: { LoadingSpinner },
    template: '<loading-spinner />',
  }))
