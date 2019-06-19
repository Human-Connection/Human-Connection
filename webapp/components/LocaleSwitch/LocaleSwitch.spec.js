import { mount, createLocalVue } from '@vue/test-utils'
import Styleguide from '@human-connection/styleguide'
import Vuex from 'vuex'
import VTooltip from 'v-tooltip'
import LocaleSwitch from './LocaleSwitch.vue'
import { mutations } from '~/store/editor'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(VTooltip)

describe('LocaleSwitch.vue', () => {
  let wrapper
  let mocks
  let computed
  let deutschLanguageItem

  beforeEach(() => {
    mocks = {
      $i18n: {
        locale: () => 'de',
        set: jest.fn(),
      },
      $t: jest.fn(),
      setPlaceholderText: jest.fn(),
    }
    computed = {
      current: () => {
        return { code: 'en' }
      },
      routes: () => {
        return [
          {
            name: 'English',
            path: 'en',
          },
          {
            name: 'Deutsch',
            path: 'de',
          },
        ]
      },
    }
  })

  describe('mount', () => {
    const store = new Vuex.Store({
      mutations: {
        'editor/SET_PLACEHOLDER_TEXT': mutations.SET_PLACEHOLDER_TEXT,
      },
    })
    const Wrapper = () => {
      return mount(LocaleSwitch, { mocks, localVue, store, computed })
    }
    beforeEach(() => {
      wrapper = Wrapper()
      wrapper.find('.locale-menu').trigger('click')
      deutschLanguageItem = wrapper.findAll('li').at(1)
      deutschLanguageItem.trigger('click')
    })

    it("changes a user's locale", () => {
      expect(mocks.$i18n.set).toHaveBeenCalledTimes(1)
    })
  })
})
