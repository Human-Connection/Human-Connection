import LoginForm from './LoginForm.vue'
import Styleguide from '@human-connection/styleguide'
import Vuex from 'vuex'
import { config, mount, createLocalVue } from '@vue/test-utils'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Styleguide)

config.stubs['nuxt-link'] = '<span><slot /></span>'
config.stubs['locale-switch'] = '<span><slot /></span>'
config.stubs['client-only'] = '<span><slot /></span>'

describe('LoginForm', () => {
  let mocks
  let propsData
  let storeMocks

  beforeEach(() => {
    propsData = {}
  })

  describe('mount', () => {
    const Wrapper = () => {
      storeMocks = {
        getters: {
          'auth/pending': () => false,
        },
        actions: {
          'auth/login': jest.fn(),
        },
      }
      const store = new Vuex.Store(storeMocks)
      mocks = {
        $t: () => {},
        $toast: {
          success: jest.fn(),
          error: jest.fn(),
        },
      }
      return mount(LoginForm, { mocks, localVue, propsData, store })
    }

    describe('fill in email and password and submit', () => {
      const fillIn = (wrapper, opts = {}) => {
        const { email = 'email@example.org', password = '1234' } = opts
        wrapper.find('input[name="email"]').setValue(email)
        wrapper.find('input[name="password"]').setValue(password)
        wrapper.find('form').trigger('submit')
      }

      it('dispatches login with form data', () => {
        fillIn(Wrapper())
        expect(storeMocks.actions['auth/login']).toHaveBeenCalledWith(
          expect.any(Object),
          { email: 'email@example.org', password: '1234' },
          undefined,
        )
      })
    })
  })
})
