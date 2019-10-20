import { mount, createLocalVue } from '@vue/test-utils'
import EnterNonce from './EnterNonce.vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('EnterNonce ', () => {
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
      return mount(EnterNonce, {
        mocks,
        localVue,
        propsData,
      })
    }

    it('renders an enter nonce form', () => {
      wrapper = Wrapper()
      expect(wrapper.find('form').exists()).toBe(true)
    })

    describe('after nonce entered', () => {
      beforeEach(() => {
        wrapper = Wrapper()
        wrapper.find('input#nonce').setValue('123456')
        wrapper.find('form').trigger('submit')
      })

      it('emits `nonceEntered`', () => {
        const expected = [[{ nonce: '123456', email: 'mail@example.org' }]]
        expect(wrapper.emitted('nonceEntered')).toEqual(expected)
      })
    })
  })
})
