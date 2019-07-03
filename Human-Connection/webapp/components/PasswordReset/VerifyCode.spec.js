import { mount, createLocalVue } from '@vue/test-utils'
import VerifyCode from './VerifyCode'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('VerifyCode ', () => {
  let wrapper
  let Wrapper
  let mocks
  let propsData

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
    }
    propsData = {
      email: 'mail@example.org',
    }
  })

  describe('mount', () => {
    beforeEach(jest.useFakeTimers)

    Wrapper = () => {
      return mount(VerifyCode, {
        mocks,
        localVue,
        propsData,
      })
    }

    it('renders a verify code form', () => {
      wrapper = Wrapper()
      expect(wrapper.find('.verify-code').exists()).toBe(true)
    })

    describe('after verification code given', () => {
      beforeEach(() => {
        wrapper = Wrapper()
        wrapper.find('input#code').setValue('123456')
        wrapper.find('form').trigger('submit')
      })

      it('emits `verifyCode`', () => {
        const expected = [[{ code: '123456', email: 'mail@example.org' }]]
        expect(wrapper.emitted('verification')).toEqual(expected)
      })
    })
  })
})
