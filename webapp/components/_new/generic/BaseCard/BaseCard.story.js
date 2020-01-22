import { storiesOf } from '@storybook/vue'
import helpers from '~/storybook/helpers'
import BaseCard from './BaseCard.vue'

storiesOf('Generic/BaseCard', module)
  .addDecorator(helpers.layout)

  .add('default', () => ({
    components: { BaseCard },
    template: `
      <base-card>
        <h2 class="card-heading">I am a card heading</h2>
        <p>And I am a paragraph.</p>
      </base-card>
    `,
  }))

  .add('with image', () => ({
    components: { BaseCard },
    template: `
      <base-card style="width: 400px;">
        <img class="card-image" src="https://unsplash.com/photos/R4y_E5ZQDPg/download" />
        <h2 class="card-heading">I am a card heading</h2>
        <p>And I am a paragraph.</p>
      </base-card>
    `,
  }))
