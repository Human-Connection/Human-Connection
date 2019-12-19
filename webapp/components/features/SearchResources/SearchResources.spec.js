import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import SearchResources from './SearchResources.vue'
import SearchableInput from '~/components/generic/SearchableInput/SearchableInput'
import { results as searchResults } from './SearchResources.story'
const localVue = global.localVue

localVue.filter('truncate', () => 'truncated string')
localVue.filter('dateTime', () => Date.now)
config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('SearchResources.vue', () => {
  let mocks, wrapper, getters
  beforeEach(() => {
    mocks = {
      $apollo: {
        query: jest.fn(),
      },
      $t: jest.fn(string => string),
    }
    getters = { 'auth/isModerator': () => false }
    wrapper = Wrapper()
  })

  const Wrapper = () => {
    const store = new Vuex.Store({
      getters,
    })
    return mount(SearchResources, { mocks, localVue, store })
  }

  describe('mount', () => {
    it('defaults to an empty array as searchResults', () => {
      expect(wrapper.vm.searchResults).toEqual([])
    })

    it('defaults to pending false, as in the search is not pending', () => {
      expect(wrapper.vm.pending).toBe(false)
    })

    describe('Emitted events', () => {
      let searchableInputComponent
      beforeEach(() => {
        searchableInputComponent = wrapper.find(SearchableInput)
      })

      describe('query event', () => {
        it('calls an apollo query', () => {
          searchableInputComponent.vm.$emit('query', 'abcd')
          expect(mocks.$apollo.query).toHaveBeenCalledWith(
            expect.objectContaining({ variables: { query: 'abcd' } }),
          )
        })
      })

      describe('clearSearch event', () => {
        beforeEach(() => {
          wrapper.setData({ searchResults, pending: true })
          searchableInputComponent.vm.$emit('clearSearch')
        })

        it('clears searchResults', () => {
          expect(wrapper.vm.searchResults).toEqual([])
        })

        it('set pending to false', () => {
          expect(wrapper.vm.pending).toBe(false)
        })
      })
    })
  })
})
