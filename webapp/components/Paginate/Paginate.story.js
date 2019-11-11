import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import Paginate from '~/components/Paginate/Paginate'
import helpers from '~/storybook/helpers'

helpers.init()

storiesOf('Paginate', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('basic pagination', () => ({
    components: { Paginate },
    data: () => ({
      hasNext: true,
      hasPrevious: false,
    }),
    methods: {
      back: action('back'),
      next: action('next'),
    },
    template: `<paginate
                :hasNext="hasNext"
                :hasPrevious="hasPrevious"
                @back="back"
                @next="next"
              />`,
  }))
