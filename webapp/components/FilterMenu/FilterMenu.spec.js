import { mount } from '@vue/test-utils'
import Vuex from 'vuex'
import FilterMenu from './FilterMenu.vue'

const localVue = global.localVue
let wrapper

describe('FilterMenu.vue', () => {
  const mocks = {
    $t: jest.fn((string) => string),
  }

  const getters = {
    'posts/isActive': () => false,
  }

  const stubs = {
    FollowingFilter: true,
    CategoriesFilter: true,
    EmotionsFilter: true,
    LanguagesFilter: true,
  }

  const Wrapper = () => {
    const store = new Vuex.Store({ getters })
    return mount(FilterMenu, { mocks, localVue, store, stubs })
  }

  beforeEach(() => {
    wrapper = Wrapper()
  })

  describe('mount', () => {
    it('starts with dropdown button inactive', () => {
      const dropdownButton = wrapper.find('.filter-menu .base-button')
      expect(dropdownButton.attributes().class).toContain('--ghost')
    })

    it('sets dropdwon button attribute `filled` when a filter is applied', () => {
      getters['posts/isActive'] = jest.fn(() => true)
      wrapper = Wrapper()
      const dropdownButton = wrapper.find('.filter-menu .base-button')
      expect(dropdownButton.attributes().class).toContain('--filled')
    })
  })
})
