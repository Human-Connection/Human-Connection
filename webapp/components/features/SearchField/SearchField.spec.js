import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import SearchField from './SearchField.vue'
import SearchableInput from '~/components/generic/SearchableInput/SearchableInput'
import { searchResults } from '~/components/generic/SearchableInput/SearchableInput.story'
const localVue = global.localVue

localVue.filter('truncate', () => 'truncated string')
localVue.filter('dateTime', () => Date.now)
config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('SearchField.vue', () => {
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
    return mount(SearchField, { mocks, localVue, store })
  }

  describe('mount', () => {
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
