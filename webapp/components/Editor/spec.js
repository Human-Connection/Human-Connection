import { mount, createLocalVue } from '@vue/test-utils'
import Editor from './'
import Vuex from 'vuex'

import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Styleguide)

describe('Editor.vue', () => {
  let wrapper
  let propsData
  let mocks
  let getters

  beforeEach(() => {
    propsData = {}
    mocks = {
      $t: () => {},
    }
    getters = {
      'editor/placeholder': () => {
        return 'some cool placeholder'
      },
    }
  })

  describe('mount', () => {
    let Wrapper = () => {
      const store = new Vuex.Store({
        getters,
      })
      return (wrapper = mount(Editor, {
        mocks,
        propsData,
        localVue,
        sync: false,
        stubs: { transition: false },
        store,
      }))
    }

    it('renders', () => {
      expect(Wrapper().is('div')).toBe(true)
    })

    describe('given a piece of text', () => {
      beforeEach(() => {
        propsData.value = 'I am a piece of text'
      })

      it.skip('renders', () => {
        wrapper = Wrapper()
        expect(wrapper.find('.ProseMirror').text()).toContain('I am a piece of text')
      })
    })

    describe('uses the placeholder', () => {
      it('from the store', () => {
        expect(wrapper.vm.editor.extensions.options.placeholder.emptyNodeText).toEqual(
          'some cool placeholder',
        )
      })
    })
  })
})
