import { config, mount, createLocalVue } from '@vue/test-utils'
import EmailVerifyPage from './verify.vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['sweetalert-icon'] = '<span><slot /></span>'

describe('EmailVerifyPage', () => {
  let store
  let mocks
  let wrapper
  let setUser

  beforeEach(() => {
    setUser = jest.fn()
    wrapper = null
    store = new Vuex.Store({
      getters: {
        'auth/user': () => {
          return { id: 'u23', email: 'some-mail@example.org' }
        },
      },
      mutations: {
        'auth/SET_USER': setUser,
      },
    })
    mocks = {
      $t: jest.fn(t => t),
      $toast: {
        success: jest.fn(),
        error: jest.fn(),
      },
      $router: {
        replace: jest.fn(),
      },
      store,
    }
  })

  describe('asyncData', () => {
    const asyncDataAction = () => {
      const context = {
        store: mocks.store,
        query: {},
        app: {
          apolloProvider: {
            defaultClient: mocks.$apollo,
          },
        },
      }
      return EmailVerifyPage.asyncData(context)
    }

    describe('backend sends successful response', () => {
      beforeEach(() => {
        mocks = {
          ...mocks,
          $apollo: {
            mutate: jest.fn().mockResolvedValue({
              data: {
                VerifyEmailAddress: {
                  email: 'verified-email@example.org',
                },
              },
            }),
          },
        }
      })

      it('sets `success` to true', async () => {
        await expect(asyncDataAction()).resolves.toEqual({
          success: true,
        })
      })

      it("updates current user's email", async () => {
        await asyncDataAction()
        expect(setUser).toHaveBeenCalledWith({}, { id: 'u23', email: 'verified-email@example.org' })
      })
    })

    describe('backend sends unsuccessful response', () => {
      beforeEach(() => {
        mocks = {
          ...mocks,
          $apollo: {
            mutate: jest.fn().mockRejectedValue({
              data: { VerifyEmailAddress: null },
              errors: [{ message: 'User account already exists with that email' }],
            }),
          },
        }
      })

      it('sets `success` to false', async () => {
        await expect(asyncDataAction()).resolves.toEqual({
          success: false,
        })
      })

      it('does not updates current user', async () => {
        await asyncDataAction()
        expect(setUser).not.toHaveBeenCalled()
      })
    })
  })

  describe('mount', () => {
    beforeEach(jest.useFakeTimers)
    const Wrapper = () => {
      return mount(EmailVerifyPage, {
        store,
        mocks,
        localVue,
      })
    }

    describe('given successful verification', () => {
      beforeEach(() => {
        mocks = { ...mocks, success: true }
        wrapper = Wrapper()
      })

      it('shows success message', () => {
        expect(wrapper.text()).toContain('settings.email.change-successful')
      })

      describe('after timeout', () => {
        beforeEach(jest.runAllTimers)

        it('redirects to email settings page', () => {
          expect(mocks.$router.replace).toHaveBeenCalledWith({
            name: 'settings-my-email-address',
          })
        })
      })
    })

    describe('given unsuccessful verification', () => {
      beforeEach(() => {
        mocks = { ...mocks, success: false }
        wrapper = Wrapper()
      })

      it('shows success message', () => {
        expect(wrapper.text()).toContain('settings.email.verification-error')
      })

      describe('after timeout', () => {
        beforeEach(jest.runAllTimers)

        it('does not redirect', () => {
          expect(mocks.$router.replace).not.toHaveBeenCalledWith()
        })
      })
    })
  })
})
