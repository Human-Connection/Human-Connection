import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import SearchResults from './SearchResults'

import helpers from '~/storybook/helpers'

helpers.init()

const localVue = global.localVue
localVue.directive('scrollTo', jest.fn())

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('SearchResults', () => {
  let mocks, getters, propsData, wrapper
  const Wrapper = () => {
    const store = new Vuex.Store({
      getters,
    })
    return mount(SearchResults, { mocks, localVue, propsData, store })
  }

  beforeEach(() => {
    mocks = {
      $t: jest.fn(),
    }
    getters = {
      'auth/user': () => {
        return { id: 'u343', name: 'Matt' }
      },
      'auth/isModerator': () => false,
    }
    propsData = {}
    wrapper = Wrapper()
  })

  describe('mount', () => {
    it('renders tab-navigation component', () => {
      expect(wrapper.find('.tab-navigation').exists()).toBe(true)
    })

    describe('searchResults', () => {
      describe('contains no results', () => {
        it('renders hc-empty component', () => {
          expect(wrapper.find('.hc-empty').exists()).toBe(true)
        })
      })

      describe('contains users less as 25 results', () => {
        beforeEach(() => {
          wrapper.setData({ users: helpers.fakeUser(1), userCount: 1, activeTab: 'User' })
        })

        it('show NOT pagination', () => {
          expect(wrapper.find('.pagination-buttons').attributes().style).toBe('display: none;')
        })

        describe('contains users more as 25 results', () => {
          beforeEach(() => {
            wrapper.setData({ users: helpers.fakeUser(52), userCount: 52, activeTab: 'User' })
          })

          it('show pagination', () => {
            expect(wrapper.find('.pagination-buttons').attributes().style).toBe('')
          })

          it('renders user-list pagination', () => {
            expect(wrapper.find('.user-list').exists()).toBe(true)
          })
        })
      })

      /*
        describe('contains posts', () => {
          beforeEach(() => {
            console.log
            wrapper.setData({ posts: [post], activeTab: 'Post' })
          })

          it('renders post-teaser component', () => {
            expect(wrapper.find('.post-teaser').exists()).toBe(true)
          })
        })
      */

      /*
        describe('switchTab', () => {
          beforeEach(() => {
            wrapper.setData({ posts: [post], users: [user], activeTab: 'Post' })
            wrapper.find('.tab-navigation').vm.$emit('switchTab', 'User')
          })

          it('switches activeTab when event is emitted', () => {
            expect(wrapper.find('.user-list').exists()).toBe(true)
          })
        })
      */
    })
  })
})
