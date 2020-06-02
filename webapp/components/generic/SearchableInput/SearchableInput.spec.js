import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Vue from 'vue'
import SearchableInput from './SearchableInput'
import { searchResults } from '~/components/generic/SearchableInput/SearchableInput.story'

const localVue = global.localVue

localVue.filter('truncate', () => 'truncated string')
localVue.filter('dateTime', () => Date.now)
config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('SearchableInput.vue', () => {
  let mocks, propsData, getters, wrapper

  beforeEach(() => {
    propsData = {}
    mocks = {
      $router: {
        push: jest.fn(),
      },
      $t: jest.fn((string) => string),
    }
    getters = { 'auth/isModerator': () => false }
    wrapper = Wrapper()
  })
  const Wrapper = () => {
    const store = new Vuex.Store({
      getters,
    })
    return mount(SearchableInput, { mocks, localVue, propsData, store })
  }

  describe('mount', () => {
    let select

    beforeEach(() => {
      select = wrapper.find('.ds-select')
      select.trigger('focus')
      select.element.value = 'abcd'
    })

    it('opens the dropdown when focused', () => {
      expect(wrapper.find('.ds-select-dropdown').isVisible()).toBe(true)
    })

    it('closes the dropdown when blurred', () => {
      select.trigger('blur')
      expect(wrapper.find('.ds-select-is-open').exists()).toBe(false)
    })

    it('closes the dropdown when cleared with esc key', () => {
      select.trigger('input')
      select.trigger('keyup.esc')
      expect(wrapper.find('.ds-select-is-open').exists()).toBe(false)
    })

    it('changes the unprocessedSearchInput as the value changes', () => {
      select.trigger('input')
      expect(select.element.value).toBe('abcd')
    })

    it('calls onDelete when the delete key is pressed', () => {
      const spy = jest.spyOn(wrapper.vm, 'onDelete')
      select.trigger('input')
      select.trigger('keyup.delete')
      expect(spy).toHaveBeenCalledTimes(1)
    })

    describe('navigating to resource', () => {
      beforeEach(() => {
        propsData = { options: searchResults }
        wrapper = Wrapper()
        select = wrapper.find('.ds-select')
        select.trigger('focus')
      })

      it('pushes to post page', async () => {
        select.element.value = 'Post'
        select.trigger('input')
        const post = wrapper.find('.search-post')
        post.trigger('click')
        await Vue.nextTick()
        expect(mocks.$router.push).toHaveBeenCalledWith({
          name: 'post-id-slug',
          params: { id: 'post-by-jenny', slug: 'user-post-by-jenny' },
        })
      })

      it("pushes to user's profile", async () => {
        select.element.value = 'Bob'
        select.trigger('input')
        const users = wrapper.findAll('.slug')
        const bob = users.filter((item) => item.text().match(/@bob-der-baumeister/))
        bob.trigger('click')
        await Vue.nextTick()
        expect(mocks.$router.push).toHaveBeenCalledWith({
          name: 'profile-id-slug',
          params: { id: 'u2', slug: 'bob-der-baumeister' },
        })
      })

      it('pushes hashtag query params', async () => {
        select.element.value = 'Hash'
        select.trigger('input')
        const tags = wrapper.findAll('.hc-hashtag')
        const tag = tags.filter((item) => item.text().match(/#Hashtag/))
        tag.trigger('click')
        await Vue.nextTick()
        expect(mocks.$router.push).toHaveBeenCalledWith('?hashtag=Hashtag')
      })
    })

    it('opens the search result page when enter is pressed', async () => {
      select.element.value = 'ab'
      select.trigger('input')
      select.trigger('keyup.enter')
      expect(mocks.$router.push).toHaveBeenCalledWith({
        path: '/search/search-results',
        query: { search: 'ab' },
      })
    })
  })
})
