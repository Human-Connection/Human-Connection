import { mount, createLocalVue } from '@vue/test-utils'
import Editor from './Editor'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import MutationObserver from 'mutation-observer'

global.MutationObserver = MutationObserver

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Styleguide)

describe('Editor.vue', () => {
  let wrapper
  let propsData
  let mocks
  let getters

  const Wrapper = () => {
    const store = new Vuex.Store({
      getters,
    })
    return (wrapper = mount(Editor, {
      mocks,
      propsData,
      localVue,
      sync: false,
      stubs: {
        transition: false,
      },
      store,
    }))
  }

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
    wrapper = Wrapper()
  })

  describe('mount', () => {
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

    describe('optional extensions', () => {
      it('sets the Mention items to the users', () => {
        propsData.users = [
          {
            id: 'u345',
          },
        ]
        wrapper = Wrapper()
        expect(wrapper.vm.editor.extensions.options.mention.items()).toEqual(propsData.users)
      })

      it('mentions is not an option when there are no users', () => {
        expect(wrapper.vm.editor.extensions.options).toEqual(
          expect.not.objectContaining({
            mention: expect.anything(),
          }),
        )
      })

      it('sets the Hashtag items to the hashtags', () => {
        propsData.hashtags = [
          {
            id: 'Frieden',
          },
        ]
        wrapper = Wrapper()
        expect(wrapper.vm.editor.extensions.options.hashtag.items()).toEqual(propsData.hashtags)
      })

      it('hashtags is not an option when there are no hashtags', () => {
        expect(wrapper.vm.editor.extensions.options).toEqual(
          expect.not.objectContaining({
            hashtag: expect.anything(),
          }),
        )
      })
    })
  })
})
