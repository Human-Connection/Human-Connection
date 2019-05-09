import { mount, createLocalVue } from '@vue/test-utils'
import index from './index.vue'
import Vue from 'vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('index.vue', () => {
  let Wrapper
  let store
  let mocks
  let getters

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        mutate: jest
          .fn()
          .mockRejectedValue({ message: 'Ouch!' })
          .mockResolvedValueOnce({
            data: {
              UpdateUser: {
                id: 'u1',
                name: 'Peter',
                locationName: 'Berlin',
                about: 'Smth'
              }
            }
          })
      },
      $toast: {
        error: jest.fn(),
        success: jest.fn()
      }
    }
    getters = {
      'auth/user': () => {
        return {}
      }
    }
  })

  describe('mount', () => {
    const Wrapper = () => {
      store = new Vuex.Store({
        getters
      })
      return mount(index, { store, mocks, localVue })
    }

    it('renders', () => {
      expect(Wrapper().contains('div')).toBe(true)
    })

    describe('given a new username and hitting submit', () => {
      it('calls updateUser mutation', () => {
        const wrapper = Wrapper()
        const input = wrapper.find('#name')
        const submitForm = wrapper.find('.ds-form')

        input.setValue('Peter')
        submitForm.trigger('submit')

        expect(mocks.$apollo.mutate).toHaveBeenCalled()
      })
    })
  })
})
