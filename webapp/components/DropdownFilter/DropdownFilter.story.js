import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import DropdownFilter from '~/components/DropdownFilter/DropdownFilter'
import helpers from '~/storybook/helpers'

helpers.init()
const filterOptions = [
  { label: 'All', value: null },
  { label: 'Read', value: true },
  { label: 'Unread', value: false },
]
storiesOf('DropdownFilter', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('filter dropdown', () => ({
    components: { DropdownFilter },
    data: () => ({
      filterOptions,
      selected: filterOptions[0].label,
    }),
    methods: {
      filter: action('filter'),
    },
    template: `<dropdown-filter
                  @filter="filter"
                  :filterOptions="filterOptions"
                  :selected="selected"
                />`,
  }))
