import { mount } from '@vue/test-utils'
import Vuex from 'vuex'
import CategoriesFilter from './CategoriesFilter'

const localVue = global.localVue

let wrapper, environmentAndNatureButton, democracyAndPoliticsButton

describe('CategoriesFilter.vue', () => {
  const mutations = {
    'posts/TOGGLE_CATEGORY': jest.fn(),
    'posts/RESET_CATEGORIES': jest.fn(),
  }
  const getters = {
    'posts/filteredCategoryIds': jest.fn(() => []),
  }

  const mocks = {
    $t: jest.fn((string) => string),
  }

  const Wrapper = () => {
    const store = new Vuex.Store({ mutations, getters })
    const wrapper = mount(CategoriesFilter, { mocks, localVue, store })
    wrapper.setData({
      categories: [
        { id: 'cat4', name: 'Environment & Nature', icon: 'tree', slug: 'environment-nature' },
        {
          id: 'cat15',
          name: 'Consumption & Sustainability',
          icon: 'shopping-cart',
          slug: 'consumption-sustainability',
        },
        {
          id: 'cat9',
          name: 'Democracy & Politics',
          icon: 'university',
          slug: 'democracy-politics',
        },
      ],
    })
    return wrapper
  }

  beforeEach(() => {
    wrapper = Wrapper()
  })

  describe('mount', () => {
    it('starts with all categories button active', () => {
      const allCategoriesButton = wrapper.find('.categories-filter .sidebar .base-button')
      expect(allCategoriesButton.attributes().class).toContain('--filled')
    })

    it('sets category button attribute `filled` when corresponding category is filtered', async () => {
      getters['posts/filteredCategoryIds'] = jest.fn(() => ['cat9'])
      wrapper = await Wrapper()
      democracyAndPoliticsButton = wrapper.findAll('.categories-filter .item .base-button').at(2)
      expect(democracyAndPoliticsButton.attributes().class).toContain('--filled')
    })

    describe('click on an "catetories-buttons" button', () => {
      it('calls TOGGLE_CATEGORY when clicked', () => {
        environmentAndNatureButton = wrapper.findAll('.categories-filter .item .base-button').at(0)
        environmentAndNatureButton.trigger('click')
        expect(mutations['posts/TOGGLE_CATEGORY']).toHaveBeenCalledWith({}, 'cat4')
      })
    })

    describe('clears filter', () => {
      it('when all button is clicked', async () => {
        getters['posts/filteredCategoryIds'] = jest.fn(() => ['cat9'])
        wrapper = await Wrapper()
        const allCategoriesButton = wrapper.find('.categories-filter .sidebar .base-button')
        allCategoriesButton.trigger('click')
        expect(mutations['posts/RESET_CATEGORIES']).toHaveBeenCalledTimes(1)
      })
    })
  })
})
