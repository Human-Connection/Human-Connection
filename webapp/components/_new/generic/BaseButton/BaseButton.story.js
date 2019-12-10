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
