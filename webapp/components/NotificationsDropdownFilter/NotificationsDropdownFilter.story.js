import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import NotificationsDropdownFilter from '~/components/NotificationsDropdownFilter/NotificationsDropdownFilter'
import helpers from '~/storybook/helpers'

helpers.init()

storiesOf('NotificationsDropdownFilter', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('filter dropdown', () => ({
    components: { NotificationsDropdownFilter },
    methods: {
      filterNotifications: action('filterNotifications'),
    },
    template: '<notifications-dropdown-filter @filterNotifications="filterNotifications" />',
  }))
