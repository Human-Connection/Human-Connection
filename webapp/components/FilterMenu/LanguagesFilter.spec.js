import { mount } from '@vue/test-utils'
import Vuex from 'vuex'
import locales from '~/locales'
import orderBy from 'lodash/orderBy'
import LanguagesFilter from './LanguagesFilter'
const localVue = global.localVue

let wrapper, englishButton, spanishButton

const languages = orderBy(locales, 'name')

describe('LanguagesFilter.vue', () => {
  const mutations = {
    'posts/TOGGLE_LANGUAGE': jest.fn(),
    'posts/RESET_LANGUAGES': jest.fn(),
  }
  const getters = {
    'posts/filteredLanguageCodes': jest.fn(() => []),
  }

  const mocks = {
    $t: jest.fn((string) => string),
  }

  const Wrapper = () => {
    const store = new Vuex.Store({ mutations, getters })
    return mount(LanguagesFilter, { mocks, localVue, store })
  }

  beforeEach(() => {
    wrapper = Wrapper()
  })

  describe('mount', () => {
    it('starts with all categories button active', () => {
      const allLanguagesButton = wrapper.find('.languages-filter .sidebar .base-button')
      expect(allLanguagesButton.attributes().class).toContain('--filled')
    })

    it('sets language button attribute `filled` when corresponding language is filtered', () => {
      getters['posts/filteredLanguageCodes'] = jest.fn(() => ['es'])
      const wrapper = Wrapper()
      spanishButton = wrapper
        .findAll('.languages-filter .item .base-button')
        .at(languages.findIndex((l) => l.code === 'es'))
      expect(spanishButton.attributes().class).toContain('--filled')
    })

    describe('click on an "language-button" button', () => {
      it('calls TOGGLE_LANGUAGE when clicked', () => {
        const wrapper = Wrapper()
        englishButton = wrapper
          .findAll('.languages-filter .item .base-button')
          .at(languages.findIndex((l) => l.code === 'en'))
        englishButton.trigger('click')
        expect(mutations['posts/TOGGLE_LANGUAGE']).toHaveBeenCalledWith({}, 'en')
      })
    })

    describe('clears filter', () => {
      it('when all button is clicked', async () => {
        getters['posts/filteredLanguageCodes'] = jest.fn(() => ['en'])
        wrapper = await Wrapper()
        const allLanguagesButton = wrapper.find('.languages-filter .sidebar .base-button')
        allLanguagesButton.trigger('click')
        expect(mutations['posts/RESET_LANGUAGES']).toHaveBeenCalledTimes(1)
      })
    })
  })
})
