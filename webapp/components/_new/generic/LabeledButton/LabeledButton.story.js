import { storiesOf } from '@storybook/vue'
import helpers from '~/storybook/helpers'
import LabeledButton from './LabeledButton.vue'

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
        label="All"
        @click="filled = !filled"
      />
    `,
  }))

  .add('filled', () => ({
    components: { LabeledButton },
    data: () => ({
      filled: true,
    }),
    template: `
      <labeled-button
        icon="check"
        :filled="filled"
        label="All"
        @click="filled = !filled"
      />
    `,
  }))
