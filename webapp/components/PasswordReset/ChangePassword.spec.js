import { mount, createLocalVue } from '@vue/test-utils'
import ChangePassword from './ChangePassword'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('ChangePassword ', () => {
  let wrapper
  let Wrapper
  let mocks
  let propsData

  beforeEach(() => {
    propsData = {}
    mocks = {
      $toast: {
        success: jest.fn(),
        error: jest.fn(),
      },
      $t: jest.fn(),
      $apollo: {
        loading: false,
        mutate: jest.fn().mockResolvedValue({ data: { resetPassword: true } }),
      },
    }
  })

  describe('mount', () => {
    beforeEach(jest.useFakeTimers)

    Wrapper = () => {
      return mount(ChangePassword, {
        mocks,
        propsData,
        localVue,
      })
    }

    describe('given email and verification code', () => {
      beforeEach(() => {
        propsData.email = 'mail@example.org'
        propsData.code = '123456'
      })

      describe('submitting new password', () => {
        beforeEach(() => {
          wrapper = Wrapper()
          wrapper.find('input#password').setValue('supersecret')
          wrapper.find('input#passwordConfirmation').setValue('supersecret')
          wrapper.find('form').trigger('submit')
        })

        it('calls resetPassword graphql mutation', () => {
          expect(mocks.$apollo.mutate).toHaveBeenCalled()
        })

        it('delivers new password to backend', () => {
          const expected = expect.objectContaining({
            variables: { code: '123456', email: 'mail@example.org', password: 'supersecret' },
          })
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expected)
        })

        describe('password reset successful', () => {
          it('displays success message', () => {
            const expected = 'verify-code.form.change-password.success'
            expect(mocks.$t).toHaveBeenCalledWith(expected)
          })

          describe('after animation', () => {
            beforeEach(jest.runAllTimers)

            it('emits `change-password-sucess`', () => {
              expect(wrapper.emitted('passwordResetResponse')).toEqual([['success']])
            })
          })
        })
      })
    })
  })
})
