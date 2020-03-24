import { storiesOf } from '@storybook/vue'
import helpers from '~/storybook/helpers'
import LabeledButton from './LabeledButton.vue'

helpers.init()

storiesOf('Generic/LabeledButton', module)
  .addDecorator(helpers.layout)
  .add('default', () => ({
    components: { LabeledButton },
    data: () => ({
      filled: false,
    }),
    template: `
      <labeled-button
        icon="check"
        :filled="filled"
        label="Toggle Me!!"
        @click="filled = !filled"
      />
    `,
  }))
