import { shallowMount, createLocalVue } from '@vue/test-utils'
import PasswordResetPage from './password-reset.vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('ProfileSlug', () => {
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
        mutate: jest.fn().mockResolvedValue(),
      },
    }
  })

  describe('shallowMount', () => {
    Wrapper = () => {
      return shallowMount(PasswordResetPage, {
        mocks,
        localVue,
      })
    }

    it('renders a password reset form', () => {
      wrapper = Wrapper()
      expect(wrapper.find('.password-reset-card').exists()).toBe(true)
    })
  })
})
