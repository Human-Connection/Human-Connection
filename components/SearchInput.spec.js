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
    wrapper = mount(SearchInput)
    expect(wrapper.vm.value).toBe('')
  })
  
  it('defaults to id "nav-search"', () => {
    wrapper = mount(SearchInput)
    expect(wrapper.vm.id).toBe('nav-search')
  })

  it('changes searchValue as a user inputs a value', () => {
    wrapper = mount(SearchInput)
    const input = wrapper.find('#nav-search')
    input.element.value = 'abc'
    input.trigger('input')
    expect(wrapper.vm.searchValue).toBe('abc')
  })
  // TODO: add similar software tests for other components
  // TODO: add more test cases in this file
})
