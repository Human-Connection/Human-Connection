import { mount, createLocalVue } from '@vue/test-utils'
import FilterMenu from './FilterMenu.vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('FilterMenu.vue', () => {
  let wrapper
  let mocks
  let propsData

  const createWrapper = mountMethod => {
    return mountMethod(FilterMenu, {
      propsData,
      mocks,
      localVue,
    })
  }

  beforeEach(() => {
    mocks = { $t: () => {} }
    propsData = {}
  })

  describe('given a user', () => {
    beforeEach(() => {
      propsData = {
        user: {
          id: '4711',
        },
      }
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

        it('toggles filterBubble.author property', () => {
          wrapper.find({ name: 'filter-by-followed-authors-only' }).trigger('click')
          expect(wrapper.emitted('changeFilterBubble')[0]).toEqual([
            { author: { followedBy_some: { id: '4711' } } },
          ])
          wrapper.find({ name: 'filter-by-followed-authors-only' }).trigger('click')
          expect(wrapper.emitted('changeFilterBubble')[1]).toEqual([{}])
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
})
