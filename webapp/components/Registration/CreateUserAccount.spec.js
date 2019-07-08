import { mount, createLocalVue } from '@vue/test-utils'
import CreateUserAccount, { SignupVerificationMutation } from './CreateUserAccount'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('CreateUserAccount', () => {
  let wrapper
  let Wrapper
  let mocks
  let propsData

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
  })

  describe('mount', () => {
    Wrapper = () => {
      return mount(CreateUserAccount, {
        mocks,
        propsData,
        localVue,
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
            wrapper.find('input#confirmPassword').setValue('hellopassword')
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
              about: '',
              name: 'John Doe',
              email: 'sixseven@example.org',
              nonce: '666777',
              password: 'hellopassword',
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
            expect(mocks.$t).toHaveBeenCalledWith('registration.create-user-account.success')
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
            expect(wrapper.find('.errors').text()).toContain('Invalid nonce')
          })
        })
      })
    })
  })
})
