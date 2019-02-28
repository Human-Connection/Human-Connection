import { shallowMount, mount } from '@vue/test-utils'
import SearchInput from './SearchInput.vue'

describe('SearchInput.vue', () => {
  let wrapper
  const mocks = { $t: () => {} }

  beforeEach(() => {
    wrapper = shallowMount(SearchInput, { mocks })
  })

  it('renders', () => {
    expect(wrapper.is('div')).toBe(true)
  })

  it('has id "nav-search"', () => {
    expect(wrapper.contains('#nav-search')).toBe(true)
  })

  it('defaults to an empty value', () => {
    wrapper = mount(SearchInput, { mocks })
    expect(wrapper.vm.value).toBe('')
  })

  it('defaults to id "nav-search"', () => {
    wrapper = mount(SearchInput, { mocks })
    expect(wrapper.vm.id).toBe('nav-search')
  })

  it('changes searchValue as a user inputs a value', () => {
    wrapper = shallowMount(SearchInput, { mocks })
    let input = wrapper.find('#nav-search')
    input.element.value = 'abc'
    input.trigger('input')
    expect(wrapper.vm.value).toBe('abc')
  })
})
