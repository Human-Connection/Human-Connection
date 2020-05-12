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
    propsData = {
      pageSize: 12,
    }
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

      describe('result contains 25 posts, 8 users and 0 hashtags', () => {
        beforeEach(() => {
          wrapper.setData({
            posts: helpers.fakePost(12),
            postCount: 25,
            users: helpers.fakeUser(8),
            userCount: 8,
            activeTab: 'Post',
          })
        })

        it('shows a total of 33 results', () => {
          expect(wrapper.find('.total-search-results').text()).toContain('33')
        })

        it('shows tab with 25 posts found', () => {
          expect(wrapper.find('.Post-tab').text()).toContain('25')
        })

        it('shows tab with 8 users found', () => {
          expect(wrapper.find('.User-tab').text()).toContain('8')
        })

        it('shows tab with 0 hashtags found', () => {
          expect(wrapper.find('.Hashtag-tab').text()).toContain('0')
        })

        it('has post tab as active tab', () => {
          expect(wrapper.find('.Post-tab').classes('--active')).toBe(true)
        })

        it('has user tab inactive', () => {
          expect(wrapper.find('.User-tab').classes('--active')).toBe(false)
        })

        it('has hashtag tab disabled', () => {
          expect(wrapper.find('.Hashtag-tab').classes('--disabled')).toBe(true)
        })

        it('displays 12 (pageSize) posts', () => {
          expect(wrapper.findAll('.post-teaser')).toHaveLength(12)
        })

        it('has post tab inactive after clicking on user tab', async () => {
          wrapper.find('.User-tab').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(wrapper.find('.Post-tab').classes('--active')).toBe(false)
        })

        it('has user tab active after clicking on user tab', async () => {
          wrapper.find('.User-tab').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(wrapper.find('.User-tab').classes('--active')).toBe(true)
        })

        it('displays 8 users after clicking on user tab', async () => {
          wrapper.find('.User-tab').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(wrapper.findAll('.user-teaser')).toHaveLength(8)
        })

        it('shows the pagination buttons for posts', () => {
          expect(wrapper.find('.pagination-buttons').exists()).toBe(true)
        })

        it('shows no pagination buttons for users', async () => {
          wrapper.find('.User-tab').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(wrapper.find('.pagination-buttons').exists()).toBe(false)
        })

        it('displays page 1 of 3 for the 25 posts', () => {
          expect(wrapper.find('.pagination-pageCount').text().replace(/\s+/g, ' ')).toContain(
            '1 / 3',
          )
        })

        it('displays the next page button for the 25 posts', () => {
          expect(wrapper.find('.next-button').exists()).toBe(true)
        })

        it('displays no previous page button for the 25 posts', () => {
          expect(wrapper.find('.previous-button').exists()).toBe(false)
        })

        it('displays page 2 / 3 when next-button is clicked', async () => {
          wrapper.find('.next-button').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(wrapper.find('.pagination-pageCount').text().replace(/\s+/g, ' ')).toContain(
            '2 / 3',
          )
        })

        it('sets apollo searchPosts offset to 12 when next-button is clicked', async () => {
          wrapper.find('.next-button').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(
            wrapper.vm.$options.apollo.searchPosts.variables.bind(wrapper.vm)(),
          ).toMatchObject({ query: undefined, firstPosts: 12, postsOffset: 12 })
        })

        it('displays the next page button when next-button is clicked', async () => {
          wrapper.find('.next-button').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(wrapper.find('.next-button').exists()).toBe(true)
        })

        it('displays the previous page button when next-button is clicked', async () => {
          wrapper.find('.next-button').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(wrapper.find('.previous-button').exists()).toBe(true)
        })

        it('displays page 3 / 3 when next-button is clicked twice', async () => {
          wrapper.find('.next-button').trigger('click')
          wrapper.find('.next-button').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(wrapper.find('.pagination-pageCount').text().replace(/\s+/g, ' ')).toContain(
            '3 / 3',
          )
        })

        it('sets apollo searchPosts offset to 24 when next-button is clicked twice', async () => {
          wrapper.find('.next-button').trigger('click')
          wrapper.find('.next-button').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(
            wrapper.vm.$options.apollo.searchPosts.variables.bind(wrapper.vm)(),
          ).toMatchObject({ query: undefined, firstPosts: 12, postsOffset: 24 })
        })

        it('displays no next page button when next-button is clicked twice', async () => {
          wrapper.find('.next-button').trigger('click')
          wrapper.find('.next-button').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(wrapper.find('.next-button').exists()).toBe(false)
        })

        it('displays the previous page button when next-button is clicked twice', async () => {
          wrapper.find('.next-button').trigger('click')
          wrapper.find('.next-button').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(wrapper.find('.previous-button').exists()).toBe(true)
        })

        it('displays page 1 / 3 when previous-button is clicked after next-button', async () => {
          wrapper.find('.next-button').trigger('click')
          await wrapper.vm.$nextTick()
          wrapper.find('.previous-button').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(wrapper.find('.pagination-pageCount').text().replace(/\s+/g, ' ')).toContain(
            '1 / 3',
          )
        })

        it('sets apollo searchPosts offset to 0 when previous-button is clicked after next-button', async () => {
          wrapper.find('.next-button').trigger('click')
          await wrapper.vm.$nextTick()
          wrapper.find('.previous-button').trigger('click')
          await wrapper.vm.$nextTick()
          await expect(
            wrapper.vm.$options.apollo.searchPosts.variables.bind(wrapper.vm)(),
          ).toMatchObject({ query: undefined, firstPosts: 12, postsOffset: 0 })
        })
      })
    })
  })
})
