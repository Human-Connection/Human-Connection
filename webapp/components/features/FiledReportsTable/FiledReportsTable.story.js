import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import FiledReportsTable from '~/components/features/FiledReportsTable/FiledReportsTable'
import helpers from '~/storybook/helpers'
import { reports } from '~/components/features/ReportList/ReportList.story.js'

storiesOf('FiledReportsTable', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('with filed reports', () => ({
    components: { FiledReportsTable },
    store: helpers.store,
    data: () => ({
      filed: reports[0].filed,
    }),
    template: `<table>
                <tbody class="report-row">
                  <tr class="row">
                    <td colspan="100%">
                      <filed-reports-table :filed="filed" />
                    </td>
                  </tr>
                </tbody>
              </table>`,
  }))
