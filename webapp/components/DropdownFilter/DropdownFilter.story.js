import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import DropdownFilter from '~/components/DropdownFilter/DropdownFilter'
import helpers from '~/storybook/helpers'

helpers.init()

storiesOf('DropdownFilter', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('filter dropdown', () => ({
    components: { DropdownFilter },
    methods: {
      filterNotifications: action('filterNotifications'),
    },
    template: '<notifications-dropdown-filter @filterNotifications="filterNotifications" />',
  }))
