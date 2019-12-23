import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Vue from 'vue'
import SearchableInput from './SearchableInput'
import { results } from '~/components/features/SearchResources/SearchResources.story'

const localVue = global.localVue

localVue.filter('truncate', () => 'truncated string')
localVue.filter('dateTime', () => Date.now)
config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('SearchableInput.vue', () => {
  let mocks, propsData, getters

  beforeEach(() => {
    propsData = {}
    mocks = {
      $router: {
        push: jest.fn(),
      },
      $t: jest.fn(string => string),
    }
    getters = { 'auth/isModerator': () => false }
  })

  describe('mount', () => {
    const Wrapper = () => {
      const store = new Vuex.Store({
        getters,
      })
      return mount(SearchableInput, { mocks, localVue, propsData, store })
    }

    it('defaults to an empty value', () => {
      expect(Wrapper().vm.value).toBe('')
    })

    it('default to a 300 millisecond delay from the time the user stops typing to when the search starts', () => {
      expect(Wrapper().vm.delay).toEqual(300)
    })

    it('defaults to an empty array as options', () => {
      expect(Wrapper().vm.options).toEqual([])
    })

    describe('testing custom functions', () => {
      let select, wrapper

      beforeEach(() => {
        wrapper = Wrapper()
        select = wrapper.find('.ds-select')
        select.trigger('focus')
        select.element.value = 'abcd'
      })

      it('opens the select dropdown when focused on', () => {
        expect(wrapper.vm.isOpen).toBe(true)
      })

      it('opens the select dropdown and blurs after focused on', () => {
        select.trigger('blur')
        expect(wrapper.vm.isOpen).toBe(false)
      })

      it('is clearable', () => {
        select.trigger('input')
        select.trigger('keyup.esc')
        expect(wrapper.emitted().clearSearch.length).toBe(1)
      })

      it('changes the unprocessedSearchInput as the value changes', () => {
        select.trigger('input')
        expect(wrapper.vm.unprocessedSearchInput).toBe('abcd')
      })

      it('searches for the term when enter is pressed', async () => {
        select.element.value = 'ab'
        select.trigger('input')
        select.trigger('keyup.enter')
        await expect(wrapper.emitted().query[0]).toEqual(['ab'])
      })

      it('calls onDelete when the delete key is pressed', () => {
        const spy = jest.spyOn(wrapper.vm, 'onDelete')
        select.trigger('input')
        select.trigger('keyup.delete')
        expect(spy).toHaveBeenCalledTimes(1)
      })

      describe('navigating to resource', () => {
        beforeEach(() => {
          propsData = { options: results }
          wrapper = Wrapper()
          select = wrapper.find('.ds-select')
          select.trigger('focus')
        })

        it('pushes to post page', async () => {
          select.element.value = 'Post'
          select.trigger('input')
          const post = wrapper.find('.search-post')
          post.trigger('click')
          await Vue.nextTick().then(() => {
            expect(mocks.$router.push).toHaveBeenCalledWith({
              name: 'post-id-slug',
              params: { id: 'post-by-jenny', slug: 'user-post-by-jenny' },
            })
          })
        })

        it("pushes to user's profile", async () => {
          select.element.value = 'Bob'
          select.trigger('input')
          const users = wrapper.findAll('.userinfo')
          const bob = users.filter(item => item.text() === '@bob-der-baumeister')
          bob.trigger('click')
          await Vue.nextTick().then(() => {
            expect(mocks.$router.push).toHaveBeenCalledWith({
              name: 'profile-id-slug',
              params: { id: 'u2', slug: 'bob-der-baumeister' },
            })
          })
        })
      })
    })
  })
})
