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
        mutate: jest.fn().mockResolvedValue({ data: { resetPassword: false } }),
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
        it.todo('calls resetPassword graphql mutation')
        it.todo('delivers new password to backend')
        it.todo('displays success message')
      })
    })
  })
})
