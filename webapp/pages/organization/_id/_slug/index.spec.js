import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Vue from 'vue'
import OrganizationSlug from './index.vue'
import HcHashtag from '~/components/Hashtag/Hashtag'

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'
config.stubs['router-link'] = '<span><slot /></span>'

const localVue = global.localVue

describe('OrganizationSlug', () => {
  let wrapper, Wrapper, backendData, mocks, stubs

  beforeEach(() => {
    const author = { id: '1stUser', slug: '1st-user' }
    backendData = {
      organization: {
        id: '1',
        creator: author,
      },
      ready: true,
    }
  })

  describe('mount', () => {
    Wrapper = async (opts = {}) => {
      jest.useFakeTimers()
      const store = new Vuex.Store({
        getters: {
          'auth/user': () => {
            return { id: '1stUser' }
          },
          'auth/isModerator': () => false,
        },
      })
      const propsData = {}
      mocks = {
        $t: jest.fn(),
        $filters: {
          truncate: (a) => a,
        },
        $route: {
          hash: '',
        },
        // If you are mocking the router, then don't use VueRouter with localVue: https://vue-test-utils.vuejs.org/guides/using-with-vue-router.html
        $router: {
          history: {
            push: jest.fn(),
          },
        },
        $toast: {
          success: jest.fn(),
          error: jest.fn(),
        },
        $apollo: {
          mutate: jest.fn().mockResolvedValue(),
          query: jest.fn().mockResolvedValue(),
        },
      }
      stubs = {
        HcEditor: { render: () => {}, methods: { insertReply: jest.fn(() => null) } },
        ContentViewer: true,
      }
      const defaults = {
        store,
        mocks,
        localVue,
        propsData,
        stubs,
      }
      const wrapper = mount(OrganizationSlug, {
        ...defaults,
        ...opts,
      })
      wrapper.setData(backendData)
      await Vue.nextTick()
      return wrapper
    }

    describe('given creator is `null`', () => {
      it('does not crash', async () => {
        backendData = {
          organization: {
            id: '1',
            creator: null,
            name: 'My organization',
          },
          ready: true,
        }
        wrapper = await Wrapper()
        expect(wrapper.find('.info.anonymous').exists()).toBe(true)
      })
    })

    describe('tags shown in tag cloud', () => {
      beforeEach(async () => {
        // Create backendData with tags, not alphabetically sorted.
        backendData.organization.tags = [
          { id: 'c' },
          { id: 'qw' },
          { id: 'BQ' },
          { id: '42' },
          { id: 'Bw' },
          { id: 'a' },
        ]

        wrapper = await Wrapper()
      })

      it('are present', async () => {
        // Get length from backendData and compare against number of tags present in component.
        expect(wrapper.findAll(HcHashtag).length).toBe(backendData.organization.tags.length)
      })

      it('are alphabetically ordered', async () => {
        // Get all HcHastag components
        const wrappers = wrapper.findAll(HcHashtag).wrappers
        // Exctract ID properties (tag names) from component.
        const ids = []
        wrappers.forEach((x) => {
          ids.push({
            id: x.props().id,
          })
        })
        // Compare extracted IDs with solution.
        const idsAlphabetically = [
          { id: '42' },
          { id: 'a' },
          { id: 'BQ' },
          { id: 'Bw' },
          { id: 'c' },
          { id: 'qw' },
        ]
        expect(ids).toStrictEqual(idsAlphabetically)
      })
    })
  })
})
