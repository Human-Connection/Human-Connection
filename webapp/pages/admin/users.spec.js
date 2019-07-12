import { mount, createLocalVue } from '@vue/test-utils'
import Users from './users.vue'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Styleguide)

describe('Users', () => {
  let wrapper
  let Wrapper
  let mocks

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
      $apollo: {
        loading: false,
        mutate: jest.fn().mockResolvedValue(),
      },
    }
  })

  describe('mount', () => {
    Wrapper = () => {
      return mount(Users, {
        mocks,
        localVue,
      })
    }

    it('renders', () => {
      wrapper = Wrapper()
      expect(wrapper.is('div')).toBe(true)
    })
  })
})
