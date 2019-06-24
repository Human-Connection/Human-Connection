import { storiesOf } from '@storybook/vue'
import HcEditor from '~/components/Editor/index.vue'

storiesOf('Editor', module)
  .add('Empty', () => ({
    components: { HcEditor },
    template: `<hc-editor value="" />`,
  }))
  .add('Hello World', () => ({
    components: { HcEditor },
    template: `<hc-editor value="Empty" />`,
  }))
