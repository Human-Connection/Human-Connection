import { mount, createLocalVue } from '@vue/test-utils'
import VTooltip from 'v-tooltip'
import Styleguide from '@human-connection/styleguide'
import Vuex from 'vuex'
import FilterPosts from './FilterPosts.vue'
import FilterPostsMenuItem from './FilterPostsMenuItems.vue'
import { mutations } from '~/store/posts'

const localVue = createLocalVue()

localVue.use(Styleguide)
localVue.use(VTooltip)
localVue.use(Vuex)

describe('FilterPosts.vue', () => {
  let wrapper
  let mocks
  let propsData
  let menuToggle
  let allCategoriesButton
  let environmentAndNatureButton
  let consumptionAndSustainabiltyButton
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
    const store = new Vuex.Store({
      mutations: {
        'posts/SET_POSTS': mutations.SET_POSTS,
      },
    })
    const Wrapper = () => {
      return mount(FilterPosts, { mocks, localVue, propsData, store })
    }

    beforeEach(() => {
      wrapper = Wrapper()
      menuToggle = wrapper.findAll('a').at(0)
      menuToggle.trigger('click')
    })

    it('groups the categories by pair', () => {
      expect(wrapper.vm.chunk).toEqual([
        [
          { id: 'cat4', name: 'Environment & Nature', icon: 'tree' },
          { id: 'cat15', name: 'Consumption & Sustainability', icon: 'shopping-cart' },
        ],
        [{ id: 'cat9', name: 'Democracy & Politics', icon: 'university' }],
      ])
    })

    it('starts with all categories button active', () => {
      allCategoriesButton = wrapper.findAll('button').at(0)
      expect(allCategoriesButton.attributes().class).toContain('ds-button-primary')
    })

    it('adds a categories id to selectedCategoryIds when clicked', () => {
      environmentAndNatureButton = wrapper.findAll('button').at(1)
      environmentAndNatureButton.trigger('click')
      const filterPostsMenuItem = wrapper.find(FilterPostsMenuItem)
      expect(filterPostsMenuItem.vm.selectedCategoryIds).toEqual(['cat4'])
    })

    it('sets primary to true when the button is clicked', () => {
      democracyAndPoliticsButton = wrapper.findAll('button').at(3)
      democracyAndPoliticsButton.trigger('click')
      expect(democracyAndPoliticsButton.attributes().class).toContain('ds-button-primary')
    })

    it('queries a post by its categories', () => {
      consumptionAndSustainabiltyButton = wrapper.findAll('button').at(2)
      consumptionAndSustainabiltyButton.trigger('click')
      expect(mocks.$apollo.query).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            filter: { categories_some: { id_in: ['cat15'] } },
            first: expect.any(Number),
            offset: expect.any(Number),
          },
        }),
      )
    })

    it('supports a query of multiple categories', () => {
      environmentAndNatureButton = wrapper.findAll('button').at(1)
      environmentAndNatureButton.trigger('click')
      consumptionAndSustainabiltyButton = wrapper.findAll('button').at(2)
      consumptionAndSustainabiltyButton.trigger('click')
      expect(mocks.$apollo.query).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: {
            filter: { categories_some: { id_in: ['cat4', 'cat15'] } },
            first: expect.any(Number),
            offset: expect.any(Number),
          },
        }),
      )
    })

    it('toggles the categoryIds when clicked more than once', () => {
      environmentAndNatureButton = wrapper.findAll('button').at(1)
      environmentAndNatureButton.trigger('click')
      environmentAndNatureButton.trigger('click')
      const filterPostsMenuItem = wrapper.find(FilterPostsMenuItem)
      expect(filterPostsMenuItem.vm.selectedCategoryIds).toEqual([])
    })
  })
})
