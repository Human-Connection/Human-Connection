import { mount, createLocalVue } from '@vue/test-utils'
import VerifyNonce from './VerifyNonce.vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('VerifyNonce ', () => {
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
      return mount(VerifyNonce, {
        mocks,
        localVue,
        propsData,
      })
    }

    it('renders a verify nonce form', () => {
      wrapper = Wrapper()
      expect(wrapper.find('.verify-nonce').exists()).toBe(true)
    })

    describe('after verification nonce given', () => {
      beforeEach(() => {
        wrapper = Wrapper()
        wrapper.find('input#nonce').setValue('123456')
        wrapper.find('form').trigger('submit')
      })

      it('emits `verification`', () => {
        const expected = [[{ nonce: '123456', email: 'mail@example.org' }]]
        expect(wrapper.emitted('verification')).toEqual(expected)
      })
    })
  })
})
