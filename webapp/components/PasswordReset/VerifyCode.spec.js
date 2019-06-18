import { mount, createLocalVue } from '@vue/test-utils'
import VerifyCode from './VerifyCode'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('VerifyCode ', () => {
  let wrapper
  let Wrapper
  let mocks

  beforeEach(() => {
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
    Wrapper = () => {
      return mount(VerifyCode, {
        mocks,
        localVue,
      })
    }

    it('renders a verify code form', () => {
      wrapper = Wrapper()
      expect(wrapper.find('.verify-code').exists()).toBe(true)
    })

    describe('after verification code given', () => {
      beforeEach(() => {
        wrapper = Wrapper()
        wrapper.find('input').setValue('123456')
        wrapper.find('form').trigger('submit')
      })

      it('displays a form to update your password', () => {
        expect(wrapper.find('.change-password').exists()).toBe(true)
      })

      describe('submitting new password', () => {
        beforeEach(() => {
          wrapper.find('input#newPassword').setValue('supersecret')
          wrapper.find('input#confirmPassword').setValue('supersecret')
          wrapper.find('form').trigger('submit')
        })

        it('calls resetPassword graphql mutation', () => {
          expect(mocks.$apollo.mutate).toHaveBeenCalled()
        })

        it('delivers new password to backend', () => {
          const expected = expect.objectContaining({ variables: { newPassword: 'supersecret' } })
          expect(mocks.$apollo.mutate).toHaveBeenCalledWith(expected)
        })

        describe('password reset successful', () => {
          it('displays success message', () => {
            const expected = 'verify-code.change-password.sucess'
            expect(mocks.$t).toHaveBeenCalledWith(expected)
          })
        })
      })
    })
  })
})
