import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import ReportsTable from '~/components/features/ReportsTable/ReportsTable'
import helpers from '~/storybook/helpers'
import { reports } from '~/components/features/ReportList/ReportList.story.js'

helpers.init()

storiesOf('ReportsTable', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('with reports', () => ({
    components: { ReportsTable },
    store: helpers.store,
    data: () => ({
      reports,
    }),
    methods: {
      confirm: action('confirm'),
    },
    template: `<reports-table :reports="reports" @confirm="confirm" />`,
  }))
  .add('without reports', () => ({
    components: { ReportsTable },
    store: helpers.store,
    template: `<reports-table />`,
  }))
