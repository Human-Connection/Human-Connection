import { storiesOf } from '@storybook/vue'
import helpers from '~/storybook/helpers'
import CounterIcon from './CounterIcon.vue'

storiesOf('Generic/CounterIcon', module)
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
      <counter-icon icon="comments" :count="150" />
    `,
  }))

  .add('danger', () => ({
    components: { CounterIcon },
    template: `
      <counter-icon icon="bell" :count="42" danger />
    `,
  }))

  .add('soft', () => ({
    components: { CounterIcon },
    template: `
      <counter-icon icon="bell" :count="42" soft />
    `,
  }))

  .add('count is 0', () => ({
    components: { CounterIcon },
    template: `
      <counter-icon icon="bell" :count="0" />
    `,
  }))
