import { mount } from '@vue/test-utils'
import SearchHeading from './SearchHeading.vue'

const localVue = global.localVue

describe('SearchHeading.vue', () => {
  let mocks, wrapper, propsData
  beforeEach(() => {
    mocks = {
      $t: jest.fn((string) => string),
    }
    propsData = {
      resourceType: 'Post',
    }
    wrapper = Wrapper()
  })

  const Wrapper = () => {
    return mount(SearchHeading, { mocks, localVue, propsData })
  }

  describe('mount', () => {
    it('renders heading', () => {
      expect(wrapper.text()).toMatch('search.heading.Post')
    })
  })
})
