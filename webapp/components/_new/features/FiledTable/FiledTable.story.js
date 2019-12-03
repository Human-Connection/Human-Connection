import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import FiledTable from '~/components/_new/features/FiledTable/FiledTable'
import helpers from '~/storybook/helpers'
import { reports } from '~/components/_new/features/ReportsTable/ReportsTable.story.js'

const filed = reports.map(report => report.filed)

storiesOf('FiledTable', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('with filed reports', () => ({
    components: { FiledTable },
    store: helpers.store,
    data: () => ({
      filed,
    }),
    template: `<table>
                <tbody  v-for="file in filed">
                  <tr>
                    <td class="ds-table-col filed-table" colspan="4">
                      <ds-space margin-bottom="base" />
                      <filed-table :filed="file" />
                    </td>
                  </tr>
                </tbody>
              </table>`,
  }))
