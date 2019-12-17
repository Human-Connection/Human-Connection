import { storiesOf } from '@storybook/vue'
import helpers from '~/storybook/helpers'
import CounterIcon from './CounterIcon.vue'

storiesOf('CounterIcon', module)
  .addDecorator(helpers.layout)

  .add('default', () => ({
    components: { CounterIcon },
    template: `
      <counter-icon icon="flag" :count="3" />
    `,
  }))

  .add('high count', () => ({
    components: { CounterIcon },
    template: `
      <counter-icon icon="bell" :count="150" />
    `,
  }))
