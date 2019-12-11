import { storiesOf } from '@storybook/vue'
import helpers from '~/storybook/helpers'
import BaseButton from './BaseButton.vue'

storiesOf('BaseButton', module)
  .addDecorator(helpers.layout)

  .add('Default', () => ({
    components: { BaseButton },
    template: '<base-button>Click me</base-button>',
  }))

  .add('With Icon', () => ({
    components: { BaseButton },
    template: '<base-button icon="edit">With Icon</base-button>',
  }))

  .add('Icon Only', () => ({
    components: { BaseButton },
    template: '<base-button icon="trash" />',
  }))

  .add('Styles and States', () => ({
    components: { BaseButton },
    template: `
      <span>
        <base-button>Default</base-button>
        <base-button primary>Primary</base-button>
        <base-button danger>Danger</base-button>
        <base-button disabled>Disabled</base-button>
        <base-button loading>Loading</base-button>
      </span>
    `,
  }))
