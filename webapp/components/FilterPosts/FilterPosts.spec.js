import { mount, createLocalVue } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Styleguide from '@human-connection/styleguide'
import Vuex from 'vuex'
import FilterPosts from './FilterPosts.vue'
const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(VTooltip)
localVue.use(Vuex)

let mutations
let getters

describe('FilterPosts.vue', () => {
  let mocks
  let propsData
  let menuToggle
  let allCategoriesButton
  let environmentAndNatureButton
  let democracyAndPoliticsButton

  beforeEach(() => {
    mocks = {
      $apollo: {
        query: jest
          .fn()
          .mockResolvedValueOnce({
            data: { Post: { title: 'Post with Category', category: [{ id: 'cat4' }] } },
          })
          .mockRejectedValue({ message: 'We were unable to filter' }),
      },
      $t: jest.fn(),
      $i18n: {
        locale: () => 'en',
      },
      $toast: {
        error: jest.fn(),
      },
    }
    propsData = {
      categories: [
        { id: 'cat4', name: 'Environment & Nature', icon: 'tree' },
        { id: 'cat15', name: 'Consumption & Sustainability', icon: 'shopping-cart' },
        { id: 'cat9', name: 'Democracy & Politics', icon: 'university' },
      ],
    }
  })

  describe('mount', () => {
    mutations = {
      'postsFilter/TOGGLE_FILTER_BY_FOLLOWED': jest.fn(),
      'postsFilter/RESET_CATEGORIES': jest.fn(),
      'postsFilter/TOGGLE_CATEGORY': jest.fn(),
    }
    getters = {
      'postsFilter/isActive': () => false,
      'auth/isModerator': () => false,
      'auth/user': () => {
        return { id: 'u34' }
      },
      'postsFilter/filteredCategoryIds': jest.fn(() => []),
      'postsFilter/filteredByUsersFollowed': jest.fn(),
    }
    const openFilterPosts = () => {
      const store = new Vuex.Store({ mutations, getters })
      const wrapper = mount(FilterPosts, { mocks, localVue, propsData, store })
      menuToggle = wrapper.findAll('button').at(0)
      menuToggle.trigger('click')
      return wrapper
    }

    it('groups the categories by pair', () => {
      const wrapper = openFilterPosts()
      expect(wrapper.vm.chunk).toEqual([
        [
          { id: 'cat4', name: 'Environment & Nature', icon: 'tree' },
          { id: 'cat15', name: 'Consumption & Sustainability', icon: 'shopping-cart' },
        ],
        [{ id: 'cat9', name: 'Democracy & Politics', icon: 'university' }],
      ])
    })

    it('starts with all categories button active', () => {
      const wrapper = openFilterPosts()
      allCategoriesButton = wrapper.findAll('button').at(1)
      expect(allCategoriesButton.attributes().class).toContain('ds-button-primary')
    })

    it('calls TOGGLE_CATEGORY when clicked', () => {
      const wrapper = openFilterPosts()
      environmentAndNatureButton = wrapper.findAll('button').at(2)
      environmentAndNatureButton.trigger('click')
      expect(mutations['postsFilter/TOGGLE_CATEGORY']).toHaveBeenCalledWith({}, 'cat4')
    })

    it('sets category button attribute `primary` when corresponding category is filtered', () => {
      getters['postsFilter/filteredCategoryIds'] = jest.fn(() => ['cat9'])
      const wrapper = openFilterPosts()
      democracyAndPoliticsButton = wrapper.findAll('button').at(4)
      expect(democracyAndPoliticsButton.attributes().class).toContain('ds-button-primary')
    })

    it('sets "filter-by-followed-authors-only" button attribute `primary`', () => {
      getters['postsFilter/filteredByUsersFollowed'] = jest.fn(() => true)
      const wrapper = openFilterPosts()
      expect(
        wrapper.find({ name: 'filter-by-followed-authors-only' }).classes('ds-button-primary'),
      ).toBe(true)
    })

    describe('click "filter-by-followed-authors-only" button', () => {
      let wrapper
      beforeEach(() => {
        wrapper = openFilterPosts()
        wrapper.find({ name: 'filter-by-followed-authors-only' }).trigger('click')
      })

      it('calls TOGGLE_FILTER_BY_FOLLOWED', () => {
        expect(mutations['postsFilter/TOGGLE_FILTER_BY_FOLLOWED']).toHaveBeenCalledWith({}, 'u34')
      })
    })
  })
})
