import { storiesOf } from '@storybook/vue'
import helpers from '~/storybook/helpers'
import CardWithColumns from './CardWithColumns.vue'

storiesOf('Generic/CardWithColumns', module)
  .addDecorator(helpers.layout)

  .add('default', () => ({
    components: { CardWithColumns },
    template: `
      <card-with-columns>
        <template v-slot:left>
          <img src="/img/sign-up/humanconnection.svg" style="width: 80%; margin: auto;" />
        </template>
        <template v-slot:right>
          <h2 style="margin-bottom: 12px">I am in the right column</h2>
          <p>And so is this paragraph.</p>
        </template>
      </card-with-columns>
    `,
  }))
