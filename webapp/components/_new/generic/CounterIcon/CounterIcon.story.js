import { storiesOf } from '@storybook/vue'
import helpers from '~/storybook/helpers'
import CounterIcon from './CounterIcon.vue'

storiesOf('CounterIcon', module)
  .addDecorator(helpers.layout)
  .add('flag icon with button in slot position', () => ({
    components: { CounterIcon },
    data() {
      return { icon: 'flag', count: 3 }
    },
    template: `
      <counter-icon icon="pizza" :count="count">
        <ds-button ghost primary>
          Report Details
        </ds-button>
      </counter-icon>
    `,
  }))
