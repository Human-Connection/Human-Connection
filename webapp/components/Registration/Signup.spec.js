import { mount, createLocalVue } from '@vue/test-utils'
import Signup, { SignupMutation, SignupByInvitationMutation } from './Signup'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('Signup', () => {
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
        mutate: jest.fn().mockResolvedValue({ data: { Signup: { email: 'mail@example.org' } } }),
      },
    }
    propsData = {}
  })

  describe('mount', () => {
    beforeEach(jest.useFakeTimers)

    Wrapper = () => {
      return mount(Signup, {
        mocks,
        propsData,
        localVue,
      })
    }

    describe('without invitation code', () => {
      it('renders signup form', () => {
        wrapper = Wrapper()
        expect(wrapper.find('.signup').exists()).toBe(true)
      })

      describe('submit', () => {
        beforeEach(async () => {
          wrapper = Wrapper()
          wrapper.find('input#email').setValue('mail@example.org')
          await wrapper.find('form').trigger('submit')
        })

        it('calls Signup graphql mutation', () => {
          const expected = expect.objectContaining({ mutation: SignupMutation })
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expected)
        })

        it('delivers email to backend', () => {
          const expected = expect.objectContaining({
            variables: { email: 'mail@example.org', token: null },
          })
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expected)
        })

        it('hides form to avoid re-submission', () => {
          expect(wrapper.find('form').exists()).not.toBeTruthy()
        })

        it('displays a message that a mail for email verification was sent', () => {
          const expected = ['registration.signup.form.success', { email: 'mail@example.org' }]
          expect(mocks.$t).toHaveBeenCalledWith(...expected)
        })

        describe('after animation', () => {
          beforeEach(jest.runAllTimers)

          it('emits `handleSubmitted`', () => {
            expect(wrapper.emitted('handleSubmitted')).toEqual([[{ email: 'mail@example.org' }]])
          })
        })
      })
    })

    describe('with invitation code', () => {
      let action
      beforeEach(() => {
        propsData.token = '666777'
        action = async () => {
          wrapper = Wrapper()
          wrapper.find('input#email').setValue('mail@example.org')
          await wrapper.find('form').trigger('submit')
          await wrapper.html()
        }
      })

      describe('submit', () => {
        it('calls SignupByInvitation graphql mutation', async () => {
          await action()
          const expected = expect.objectContaining({ mutation: SignupByInvitationMutation })
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expected)
        })

        it('delivers invitation token to backend', async () => {
          await action()
          const expected = expect.objectContaining({
            variables: { email: 'mail@example.org', token: '666777' },
          })
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expected)
        })

        describe('in case a user account with the email already exists', () => {
          beforeEach(() => {
            mocks.$apollo.mutate = jest
              .fn()
              .mockRejectedValue(
                new Error('UserInputError: User account with this email already exists.'),
              )
          })

          it('explains the error', async () => {
            await action()
            expect(mocks.$t).toHaveBeenCalledWith('registration.signup.form.errors.email-exists')
          })
        })

        describe('in case the invitation code was incorrect', () => {
          beforeEach(() => {
            mocks.$apollo.mutate = jest
              .fn()
              .mockRejectedValue(
                new Error('UserInputError: Invitation code already used or does not exist.'),
              )
          })

          it('explains the error', async () => {
            await action()
            expect(mocks.$t).toHaveBeenCalledWith(
              'registration.signup.form.errors.invalid-invitation-token',
            )
          })
        })
      })
    })
  })
})
