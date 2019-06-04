import { mount, createLocalVue } from '@vue/test-utils'
import FilterMenu from './FilterMenu.vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('FilterMenu.vue', () => {
  let wrapper
  let mocks

  const createWrapper = mountMethod => {
    return mountMethod(FilterMenu, {
      mocks,
      localVue,
    })
  }

  beforeEach(() => {
    mocks = { $t: () => {} }
  })

  describe('mount', () => {
    beforeEach(() => {
      wrapper = createWrapper(mount)
    })

    it('renders a card', () => {
      expect(wrapper.is('.ds-card')).toBe(true)
    })

    describe('click "filter-by-followed-authors-only" button', () => {
      it('emits filterBubble object', () => {
        wrapper.find({ name: 'filter-by-followed-authors-only' }).trigger('click')
        expect(wrapper.emitted('changeFilterBubble')).toBeTruthy()
      })

      it('toggles filterBubble.author.followed property', () => {
        wrapper.find({ name: 'filter-by-followed-authors-only' }).trigger('click')
        expect(wrapper.emitted('changeFilterBubble')[0]).toEqual([{ author: 'followed' }])
        wrapper.find({ name: 'filter-by-followed-authors-only' }).trigger('click')
        expect(wrapper.emitted('changeFilterBubble')[1]).toEqual([{ author: 'all' }])
      })

      it('makes button primary', () => {
        wrapper.find({ name: 'filter-by-followed-authors-only' }).trigger('click')
        expect(
          wrapper.find({ name: 'filter-by-followed-authors-only' }).classes('ds-button-primary'),
        ).toBe(true)
      })
    })
  })
})
