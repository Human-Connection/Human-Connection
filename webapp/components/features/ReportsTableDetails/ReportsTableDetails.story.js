import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import ReportsTableDetails from '~/components/features/ReportsTableDetails/ReportsTableDetails'
import helpers from '~/storybook/helpers'
import { reports } from '~/components/features/ReportList/ReportList.story.js'

storiesOf('ReportsTableDetails', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('with filed reports', () => ({
    components: { ReportsTableDetails },
    store: helpers.store,
    data: () => ({
      filed: reports[0].filed,
    }),
    template: `<table>
                <tbody class="report-row">
                  <tr class="row">
                    <td colspan="100%">
                      <reports-table-details :filed="filed" />
                    </td>
                  </tr>
                </tbody>
              </table>`,
  }))
