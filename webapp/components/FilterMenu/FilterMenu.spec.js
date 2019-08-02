import { mount, createLocalVue } from '@vue/test-utils'
import FilterMenu from './FilterMenu.vue'
import Styleguide from '@human-connection/styleguide'
import VTooltip from 'v-tooltip'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(VTooltip)

describe('FilterMenu.vue', () => {
  let wrapper
  let mocks
  let propsData

  beforeEach(() => {
    mocks = { $t: () => {} }
  })

  describe('given a user', () => {
    beforeEach(() => {
      propsData = {
        hashtag: {},
      }
    })

    describe('mount', () => {
      const Wrapper = () => {
        return mount(FilterMenu, { mocks, localVue, propsData })
      }
      beforeEach(() => {
        wrapper = Wrapper()
      })

      it('does not render a card if there are no hashtags', () => {
        expect(wrapper.is('.ds-card')).toBe(true)
      })

      it('renders a card if there are hashtags', () => {
        propsData.hashtag = { hashtag: 'Frieden' }
        wrapper = Wrapper()
        expect(wrapper.is('.ds-card')).toBe(true)
      })

      describe('click "clear-search-button" button', () => {
        it('emits clearSearch', () => {
          wrapper.find({ name: 'clear-search-button' }).trigger('click')
          expect(wrapper.emitted().clearSearch).toHaveLength(1)
        })
      })
    })
  })
})
