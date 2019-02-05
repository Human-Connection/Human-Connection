import { shallowMount, mount } from '@vue/test-utils'
import SearchInput from './SearchInput.vue'

describe('SearchInput.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SearchInput, {})
  })

  it('renders', () => {
    expect(wrapper.is('div')).toBe(true)
  })

  it('has id "nav-search"', () => {
    expect(wrapper.contains('#nav-search')).toBe(true)
  })

  it('defaults to an empty value', () => {
    wrapper = mount(SearchInput, {
      propsData: {
        value: null
      }
    })
    expect(wrapper.text()).toBe('')
  })
  
  // TODO: add similar software tests for other components
  // TODO: add more test cases in this file
})
