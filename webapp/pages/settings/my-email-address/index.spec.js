import { config, mount, createLocalVue } from '@vue/test-utils'
import EmailSettingsIndexPage from './index.vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

config.stubs['sweetalert-icon'] = '<span><slot /></span>'

describe('EmailSettingsIndexPage', () => {
  let store
  let mocks
  let wrapper

  beforeEach(() => {
    wrapper = null
    store = new Vuex.Store({
      getters: {
        'auth/user': () => {
          return { id: 'u23', email: 'some-mail@example.org' }
        },
      },
    })
    mocks = {
      $t: jest.fn(t => t),
      $toast: {
        success: jest.fn(),
        error: jest.fn(),
      },
      $apollo: {
        mutate: jest.fn().mockResolvedValue(),
      },
      $router: {
        push: jest.fn(),
      },
    }
  })

  describe('mount', () => {
    const Wrapper = () => {
      return mount(EmailSettingsIndexPage, {
        store,
        mocks,
        localVue,
      })
    }

    describe('form', () => {
      describe('submit', () => {
        beforeEach(jest.useFakeTimers)

        describe('email unchanged', () => {
          beforeEach(() => {
            wrapper = Wrapper()
            wrapper.find('form').trigger('submit')
          })

          it('displays form errors', () => {
            expect(wrapper.text()).not.toContain('settings.email.submitted')
            expect(wrapper.text()).toContain('settings.email.validation.same-email')
          })

          it('does not call $apollo.mutate', () => {
            expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
          })
        })

        describe('enter another email', () => {
          beforeEach(() => {
            wrapper = Wrapper()
            wrapper.find('#email').setValue('yet-another-email@example.org')
            wrapper.find('form').trigger('submit')
          })

          it('calls $apollo.mutate', () => {
            expect(mocks.$apollo.mutate).toHaveBeenCalled()
          })

          it('no form errors', () => {
            expect(wrapper.text()).not.toContain('settings.email.validation.same-email')
            expect(wrapper.text()).toContain('settings.email.submitted')
          })

          describe('after timeout', () => {
            beforeEach(jest.runAllTimers)

            it('redirects to `my-email-address/enter-nonce`', () => {
              expect(mocks.$router.push).toHaveBeenCalledWith({
                path: 'my-email-address/enter-nonce',
                query: { email: 'yet-another-email@example.org' },
              })
            })
          })
        })

        describe('if backend responds with unique constraint violation', () => {
          beforeEach(() => {
            mocks.$apollo.mutate = jest.fn().mockRejectedValue({
              message: 'User account already exists',
            })
            wrapper = Wrapper()
            wrapper.find('#email').setValue('already-taken@example.org')
            wrapper.find('form').trigger('submit')
          })

          it('translates error message', () => {
            expect(wrapper.text()).toContain('registration.signup.form.errors.email-exists')
          })
        })
      })
    })
  })
})
