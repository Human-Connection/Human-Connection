import { mount } from '@vue/test-utils'
import EnterNoncePage from './enter-nonce.vue'

const localVue = global.localVue

describe('EnterNoncePage', () => {
  let mocks
  let wrapper

  beforeEach(() => {
    wrapper = null
    mocks = {
      $t: jest.fn((t) => t),
      $route: {
        query: {},
      },
      $router: {
        replace: jest.fn(),
      },
    }
  })

  describe('mount', () => {
    const Wrapper = () => {
      return mount(EnterNoncePage, {
        mocks,
        localVue,
      })
    }

    describe('form', () => {
      describe('submit', () => {
        it('renders form errors', () => {
          wrapper = Wrapper()
          wrapper.find('form').trigger('submit')
          expect(mocks.$router.replace).not.toHaveBeenCalled()
        })

        describe('entering a nonce', () => {
          it('redirects to my-email-address/verify', () => {
            wrapper = Wrapper()
            wrapper.find('#nonce').setValue('foobar')
            wrapper.find('form').trigger('submit')
            expect(mocks.$router.replace).toHaveBeenCalled()
          })
        })
      })
    })
  })
})
