import { mount, createLocalVue } from '@vue/test-utils'
import index from './index.vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('index.vue', () => {
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
                slug: 'peter',
                name: 'Peter',
                locationName: 'Berlin',
                about: 'Smth',
              },
            },
          }),
      },
      $toast: {
        error: jest.fn(),
        success: jest.fn(),
      },
    }
    getters = {
      'auth/user': () => ({}),
    }
  })

  describe('mount', () => {
    let options
    const Wrapper = () => {
      store = new Vuex.Store({
        getters,
      })
      return mount(index, { store, mocks, localVue, ...options })
    }

    beforeEach(() => {
      options = {}
    })

    it('renders', () => {
      expect(Wrapper().contains('div')).toBe(true)
    })

    describe('given form validation errors', () => {
      beforeEach(() => {
        options = {
          ...options,
          computed: {
            formSchema: () => ({
              slug: [
                (_rule, _value, callback) => {
                  callback(new Error('Ouch!'))
                },
              ],
            }),
          },
        }
      })

      it('cannot call updateUser mutation', () => {
        const wrapper = Wrapper()

        wrapper.find('#name').setValue('Peter')
        wrapper.find('.ds-form').trigger('submit')

        expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
      })
    })

    describe('no form validation errors', () => {
      beforeEach(() => {
        options = { ...options, computed: { formSchema: () => ({}) } }
      })

      describe('given a new username and hitting submit', () => {
        it('calls updateUser mutation', () => {
          const wrapper = Wrapper()

          wrapper.find('#name').setValue('Peter')
          wrapper.find('.ds-form').trigger('submit')

          expect(mocks.$apollo.mutate).toHaveBeenCalled()
        })
      })
    })
  })
})
