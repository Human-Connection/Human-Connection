import { config, mount, createLocalVue } from '@vue/test-utils'
import CreateUserAccount from './CreateUserAccount'
import { SignupVerificationMutation } from '~/graphql/Registration.js'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)
config.stubs['sweetalert-icon'] = '<span><slot /></span>'
config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('CreateUserAccount', () => {
  let wrapper, Wrapper, mocks, propsData, stubs

  beforeEach(() => {
    mocks = {
      $toast: {
        success: jest.fn(),
        error: jest.fn(),
      },
      $t: jest.fn(),
      $apollo: {
        loading: false,
        mutate: jest.fn(),
      },
    }
    propsData = {}
    stubs = {
      LocaleSwitch: "<div class='stub'></div>",
    }
  })

  describe('mount', () => {
    Wrapper = () => {
      return mount(CreateUserAccount, {
        mocks,
        propsData,
        localVue,
        stubs,
      })
    }

    describe('given email and nonce', () => {
      beforeEach(() => {
        propsData.nonce = '666777'
        propsData.email = 'sixseven@example.org'
      })

      it('renders a form to create a new user', () => {
        wrapper = Wrapper()
        expect(wrapper.find('.create-user-account').exists()).toBe(true)
      })

      describe('submit', () => {
        let action
        beforeEach(() => {
          action = async () => {
            wrapper = Wrapper()
            wrapper.find('input#name').setValue('John Doe')
            wrapper.find('input#password').setValue('hellopassword')
            wrapper.find('textarea#about').setValue('Hello I am the `about` attribute')
            wrapper.find('input#passwordConfirmation').setValue('hellopassword')
            wrapper.find('input#checkbox0').setChecked()
            wrapper.find('input#checkbox1').setChecked()
            wrapper.find('input#checkbox2').setChecked()
            await wrapper.find('form').trigger('submit')
            await wrapper.html()
          }
        })

        it('calls CreateUserAccount graphql mutation', async () => {
          await action()
          const expected = expect.objectContaining({ mutation: SignupVerificationMutation })
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expected)
        })

        it('delivers data to backend', async () => {
          await action()
          const expected = expect.objectContaining({
            variables: {
              about: 'Hello I am the `about` attribute',
              name: 'John Doe',
              email: 'sixseven@example.org',
              nonce: '666777',
              password: 'hellopassword',
              termsAndConditionsAgreedVersion: '0.0.2',
            },
          })
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expected)
        })

        describe('in case mutation resolves', () => {
          beforeEach(() => {
            mocks.$apollo.mutate = jest.fn().mockResolvedValue({
              data: {
                SignupVerification: {
                  id: 'u1',
                  name: 'John Doe',
                  slug: 'john-doe',
                },
              },
            })
          })

          it('displays success', async () => {
            await action()
            expect(mocks.$t).toHaveBeenCalledWith(
              'components.registration.create-user-account.success',
            )
          })

          describe('after timeout', () => {
            beforeEach(jest.useFakeTimers)

            it('emits `userCreated` with { password, email }', async () => {
              await action()
              jest.runAllTimers()
              expect(wrapper.emitted('userCreated')).toEqual([
                [
                  {
                    email: 'sixseven@example.org',
                    password: 'hellopassword',
                  },
                ],
              ])
            })
          })
        })

        describe('in case mutation rejects', () => {
          beforeEach(() => {
            mocks.$apollo.mutate = jest.fn().mockRejectedValue(new Error('Invalid nonce'))
          })

          it('displays form errors', async () => {
            await action()
            expect(mocks.$t).toHaveBeenCalledWith(
              'components.registration.create-user-account.error',
            )
          })
        })
      })
    })
  })
})
