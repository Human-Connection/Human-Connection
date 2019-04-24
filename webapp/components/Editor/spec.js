import { mount, createLocalVue } from '@vue/test-utils'
import Editor from './'

import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()
localVue.use(Styleguide)

describe('Editor.vue', () => {
  let wrapper
  let propsData
  let mocks

  beforeEach(() => {
    propsData = {}
    mocks = {
      $t: () => {}
    }
  })

  describe('mount', () => {
    let Wrapper = () => {
      return (wrapper = mount(Editor, {
        mocks,
        propsData,
        localVue,
        sync: false,
        stubs: { transition: false }
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
        expect(wrapper.find('.ProseMirror').text()).toContain(
          'I am a piece of text'
        )
      })
    })
  })
})
