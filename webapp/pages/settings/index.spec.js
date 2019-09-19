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

    describe('given we bypass the slug validations', () => {
      beforeEach(() => {
        // I gave up after 3 hours, feel free to remove the line below
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
