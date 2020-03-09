import { mount } from '@vue/test-utils'
import FilterMenu from './FilterMenu.vue'

const localVue = global.localVue

describe('FilterMenu.vue', () => {
  let wrapper
  let mocks
  let propsData

  beforeEach(() => {
    mocks = { $t: () => {} }
  })

  describe('given a hashtag', () => {
    beforeEach(() => {
      propsData = {
        hashtag: 'Frieden',
      }
    })

    describe('mount', () => {
      const Wrapper = () => {
        return mount(FilterMenu, { mocks, localVue, propsData })
      }
      beforeEach(() => {
        wrapper = Wrapper()
      })

      it('renders a card', () => {
        wrapper = Wrapper()
        expect(wrapper.is('.base-card')).toBe(true)
      })

      describe('click clear search button', () => {
        it('emits clearSearch', () => {
          wrapper.find('.base-button').trigger('click')
          expect(wrapper.emitted().clearSearch).toHaveLength(1)
        })
      })
    })
  })
})
