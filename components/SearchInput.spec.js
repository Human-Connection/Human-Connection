import { mount, createLocalVue } from '@vue/test-utils'
import SearchInput from './SearchInput.vue'
import Vue from 'vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('SearchInput.vue', () => {
  let wrapper
  let mocks
  let propsData

  beforeEach(() => {
    propsData = {}
  })

  describe('mount', () => {
    const Wrapper = () => {
      mocks = {
        $t: () => {}
      }
      return mount(SearchInput, { mocks, localVue, propsData })
    }

    it('renders', () => {
      expect(Wrapper().is('div')).toBe(true)
    })

    it('has id "nav-search"', () => {
      expect(Wrapper().contains('#nav-search')).toBe(true)
    })

    it('defaults to an empty value', () => {
      expect(Wrapper().vm.value).toBe('')
    })

    it('defaults to id "nav-search"', () => {
      expect(Wrapper().vm.id).toBe('nav-search')
    })

    it('default to a 300 millisecond delay from the time the user stops typing to when the search starts', () => {
      expect(Wrapper().vm.delay).toEqual(300)
    })

    it('defaults to an empty array as results', () => {
      expect(Wrapper().vm.results).toEqual([])
    })

    it('defaults to pending false, as in the search is not pending', () => {
      expect(Wrapper().vm.pending).toBe(false)
    })

    it('accepts values as a string', () => {
      propsData = { value: 'abc' }
      const wrapper = Wrapper()
      // expect(wrapper.vm._data.searchValue).toEqual('abc')
      expect(wrapper.vm.value).toEqual('abc')
    })

    it('opens the select dropdown when focused on', () => {
      const wrapper = Wrapper()
      const select = wrapper.find('.ds-select')
      select.trigger('focus')
      expect(wrapper.vm.isOpen).toBe(true)
      select.trigger('blur')
      expect(wrapper.vm.isOpen).toBe(false)
      // expect(wrapper.find('.ds-select-dropdown').text()).toContain(
      //   ' What are you searching for?'
      // )
    })

    it('is clearable', () => {
      const wrapper = Wrapper()
      const select = wrapper.find('.ds-select')
      select.trigger('focus')
      const input = wrapper.find('input')
      input.setValue('Volu')
      input.trigger('keydown.esc')
      // const clearIcon = wrapper.find('.search-clear-btn')
      // clearIcon.trigger('click')
      expect(input.element.value).toBe('')
    })
  })
})
