import { storiesOf } from '@storybook/vue'
import helpers from '~/storybook/helpers'
import BaseButton from './BaseButton.vue'

storiesOf('Generic/BaseButton', module)
  .addDecorator(helpers.layout)

  .add('default', () => ({
    components: { BaseButton },
    template: `
      <div>
        <base-button>Click me</base-button>
        <base-button disabled>Disabled</base-button>
        <base-button loading>Loading</base-button>
      </div>
    `,
  }))

  .add('icon', () => ({
    components: { BaseButton },
    template: `
      <div>
        <base-button icon="edit">With Text</base-button>
        <base-button icon="trash" />
        <base-button icon="trash" disabled />
        <base-button icon="trash" loading />
      </div>
    `,
  }))

  .add('primary', () => ({
    components: { BaseButton },
    template: `
      <div>
        <base-button primary>Primary</base-button>
        <base-button primary disabled>Disabled</base-button>
        <base-button primary loading>Loading</base-button>
      </div>
    `,
  }))

  .add('danger', () => ({
    components: { BaseButton },
    template: `
      <div>
        <base-button danger>Danger</base-button>
        <base-button danger disabled>Disabled</base-button>
        <base-button danger loading>Loading</base-button>
      </div>
    `,
  }))

  .add('circle', () => ({
    components: { BaseButton },
    template: `
      <div>
        <base-button circle icon="eye" />
        <base-button circle>EN</base-button>
        <base-button circle disabled icon="eye-slash" />
        <base-button circle loading icon="eye-slash" />
      </div>
    `,
  }))
