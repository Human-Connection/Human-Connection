import { mount, createLocalVue } from '@vue/test-utils'
import Styleguide from '@human-connection/styleguide'
import VTooltip from 'v-tooltip'
import LocaleSwitch from './LocaleSwitch.vue'
import Vuex from 'vuex'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(VTooltip)
localVue.use(Vuex)

describe('LocaleSwitch.vue', () => {
  let wrapper, mocks, computed, deutschLanguageItem, getters

  beforeEach(() => {
    mocks = {
      $i18n: {
        locale: () => 'en',
        set: jest.fn(locale => locale),
      },
      $t: jest.fn(),
      $toast: {
        success: jest.fn(a => a),
        error: jest.fn(a => a),
      },
      setPlaceholderText: jest.fn(),
      $apollo: {
        mutate: jest
          .fn()
          .mockResolvedValueOnce({
            data: {
              UpdateUser: {
                locale: 'de',
              },
            },
          })
          .mockRejectedValueOnce({
            message: 'Please log in!',
          }),
      },
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
    getters = {
      'auth/user': () => {
        return { id: 'u35' }
      },
    }
  })

  const Wrapper = () => {
    const store = new Vuex.Store({
      getters,
    })
    return mount(LocaleSwitch, { mocks, localVue, computed, store })
  }

  describe('with current user', () => {
    beforeEach(() => {
      wrapper = Wrapper()
      wrapper.find('.locale-menu').trigger('click')
      deutschLanguageItem = wrapper.findAll('li').at(1)
      deutschLanguageItem.trigger('click')
    })

    it("sets a user's locale", () => {
      expect(mocks.$i18n.set).toHaveBeenCalledTimes(1)
    })

    it("updates the user's locale in the database", () => {
      expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
    })
  })

  describe('no current user', () => {
    beforeEach(() => {
      getters = {
        'auth/user': () => {
          return null
        },
      }
      wrapper = Wrapper()
      wrapper.find('.locale-menu').trigger('click')
      deutschLanguageItem = wrapper.findAll('li').at(1)
      deutschLanguageItem.trigger('click')
    })

    it('does not send a UpdateUser mutation', () => {
      expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
    })
  })
})
