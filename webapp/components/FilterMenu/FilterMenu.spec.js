import { mount } from '@vue/test-utils'

import Vuex from 'vuex'
import FilterMenu from './FilterMenu.vue'
import locales from '~/locales'
import orderBy from 'lodash/orderBy'

const localVue = global.localVue

let mutations
let getters

const languages = orderBy(locales, 'name')

describe('FilterMenu.vue', () => {
  let mocks
  let propsData
  let menuToggle
  let allCategoriesButton
  let environmentAndNatureButton
  let democracyAndPoliticsButton
  let happyEmotionButton
  let englishButton
  let spanishButton

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
      'posts/TOGGLE_FILTER_BY_FOLLOWED': jest.fn(),
      'posts/RESET_CATEGORIES': jest.fn(),
      'posts/TOGGLE_CATEGORY': jest.fn(),
      'posts/TOGGLE_EMOTION': jest.fn(),
      'posts/TOGGLE_LANGUAGE': jest.fn(),
      'posts/RESET_LANGUAGES': jest.fn(),
    }
    getters = {
      'posts/isActive': () => false,
      'auth/isModerator': () => false,
      'auth/user': () => {
        return { id: 'u34' }
      },
      'posts/filteredCategoryIds': jest.fn(() => []),
      'posts/filteredByUsersFollowed': jest.fn(),
      'posts/filteredByEmotions': jest.fn(() => []),
      'posts/filteredLanguageCodes': jest.fn(() => []),
    }
    const openFilterMenu = () => {
      const store = new Vuex.Store({ mutations, getters })
      const wrapper = mount(FilterMenu, { mocks, localVue, propsData, store })
      menuToggle = wrapper.findAll('button').at(0)
      menuToggle.trigger('click')
      return wrapper
    }

    it('groups the categories by pair', () => {
      const wrapper = openFilterMenu()
      expect(wrapper.vm.chunk).toEqual([
        [
          { id: 'cat4', name: 'Environment & Nature', icon: 'tree' },
          { id: 'cat15', name: 'Consumption & Sustainability', icon: 'shopping-cart' },
        ],
        [{ id: 'cat9', name: 'Democracy & Politics', icon: 'university' }],
      ])
    })

    it('starts with all categories button active', () => {
      const wrapper = openFilterMenu()
      allCategoriesButton = wrapper.findAll('button').at(1)
      expect(allCategoriesButton.attributes().class).toContain('--filled')
    })

    it('calls TOGGLE_CATEGORY when clicked', () => {
      const wrapper = openFilterMenu()
      environmentAndNatureButton = wrapper.findAll('button').at(2)
      environmentAndNatureButton.trigger('click')
      expect(mutations['posts/TOGGLE_CATEGORY']).toHaveBeenCalledWith({}, 'cat4')
    })

    it('calls TOGGLE_LANGUAGE when clicked', () => {
      const wrapper = openFilterMenu()
      englishButton = wrapper
        .findAll('button.language-buttons')
        .at(languages.findIndex(l => l.code === 'en'))
      englishButton.trigger('click')
      expect(mutations['posts/TOGGLE_LANGUAGE']).toHaveBeenCalledWith({}, 'en')
    })

    it('sets category button attribute `filled` when corresponding category is filtered', () => {
      getters['posts/filteredCategoryIds'] = jest.fn(() => ['cat9'])
      const wrapper = openFilterMenu()
      democracyAndPoliticsButton = wrapper.findAll('button').at(4)
      expect(democracyAndPoliticsButton.attributes().class).toContain('--filled')
    })

    it('sets language button attribute `filled` when corresponding language is filtered', () => {
      getters['posts/filteredLanguageCodes'] = jest.fn(() => ['es'])
      const wrapper = openFilterMenu()
      spanishButton = wrapper
        .findAll('button.language-buttons')
        .at(languages.findIndex(l => l.code === 'es'))
      expect(spanishButton.attributes().class).toContain('--filled')
    })

    it('sets "filter-by-followed" button attribute `filled`', () => {
      getters['posts/filteredByUsersFollowed'] = jest.fn(() => true)
      const wrapper = openFilterMenu()
      expect(wrapper.find('.base-button[data-test="filter-by-followed"]').classes('--filled')).toBe(
        true,
      )
    })

    describe('click "filter-by-followed" button', () => {
      let wrapper
      beforeEach(() => {
        wrapper = openFilterMenu()
        wrapper.find('.base-button[data-test="filter-by-followed"]').trigger('click')
      })

      it('calls TOGGLE_FILTER_BY_FOLLOWED', () => {
        expect(mutations['posts/TOGGLE_FILTER_BY_FOLLOWED']).toHaveBeenCalledWith({}, 'u34')
      })
    })

    describe('click on an "emotions-buttons" button', () => {
      it('calls TOGGLE_EMOTION when clicked', () => {
        const wrapper = openFilterMenu()
        happyEmotionButton = wrapper.findAll('.emotion-button .base-button').at(1)
        happyEmotionButton.trigger('click')
        expect(mutations['posts/TOGGLE_EMOTION']).toHaveBeenCalledWith({}, 'happy')
      })

      it('sets the attribute `src` to colorized image', () => {
        getters['posts/filteredByEmotions'] = jest.fn(() => ['happy'])
        const wrapper = openFilterMenu()
        happyEmotionButton = wrapper.findAll('.emotion-button .base-button').at(1)
        const happyEmotionButtonImage = happyEmotionButton.find('img')
        expect(happyEmotionButtonImage.attributes().src).toEqual('/img/svg/emoji/happy_color.svg')
      })
    })
  })
})
