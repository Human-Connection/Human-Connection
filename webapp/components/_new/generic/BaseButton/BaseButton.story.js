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
        <base-button icon="bullhorn" />
        <base-button icon="trash" disabled />
        <base-button icon="trash" loading />
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

  .add('filled', () => ({
    components: { BaseButton },
    template: `
      <div>
        <base-button filled>Filled</base-button>
        <base-button filled danger>Filled Danger</base-button>
        <base-button filled disabled>Disabled</base-button>
        <base-button filled loading>Loading</base-button>
      </div>
    `,
  }))

  .add('small', () => ({
    components: { BaseButton },
    template: `
      <div>
        <base-button size="small">Small</base-button>
        <base-button size="small" circle>S</base-button>
      </div>
    `,
  }))

  .add('ghost', () => ({
    // TODO: add documentation --> ghost button should only be used for very special occasions
    // e.g. for the ContentMenu + for the EditorMenuBarButtons
    components: { BaseButton },
    template: `
      <div>
        <base-button size="small" icon="ellipsis-v" circle ghost />
      </div>
    `,
  }))
