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

    it('defaults to an empty value', () => {
      expect(Wrapper().vm.value).toBe('')
    })

    it('has id "nav-search"', () => {
      expect(Wrapper().contains('#nav-search')).toBe(true)
    })

    it('defaults to id "nav-search"', () => {
      expect(Wrapper().vm.id).toBe('nav-search')
    })

    it('changes searchValue as a user inputs a value', () => {
      const wrapper = Wrapper()
      let input = wrapper.find('input')
      input.setValue('abc') 
      expect(wrapper.vm.searchValue).toBe('abc')
    })
  })
})