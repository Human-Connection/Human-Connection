import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import Vue from 'vue'
import PostSlug from './index.vue'
import CommentList from '~/components/CommentList/CommentList'

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'
config.stubs['router-link'] = '<span><slot /></span>'

const localVue = global.localVue
localVue.directive('scrollTo', jest.fn())

describe('PostSlug', () => {
  let wrapper, Wrapper, backendData, mocks, stubs

  beforeEach(() => {
    const author = { id: '1stUser', slug: '1st-user' }
    backendData = {
      post: {
        id: '1',
        author,
        comments: [
          {
            id: 'comment134',
            contentExcerpt: 'this is a comment',
            content: 'this is a comment',
            author,
          },
        ],
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
          truncate: a => a,
          removeHtml: a => a,
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
          query: jest.fn().mockResolvedValue({ data: { PostEmotionsCountByEmotion: {} } }),
        },
        $scrollTo: jest.fn(),
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
      const wrapper = mount(PostSlug, {
        ...defaults,
        ...opts,
      })
      wrapper.setData(backendData)
      await Vue.nextTick()
      return wrapper
    }

    describe('given author is `null`', () => {
      it('does not crash', async () => {
        backendData = {
          post: {
            id: '1',
            author: null,
            comments: [],
          },
          ready: true,
        }
        wrapper = await Wrapper()
        expect(wrapper.find('.info.anonymous').exists()).toBe(true)
      })
    })

    describe('test Post callbacks', () => {
      describe('deletion of Post from Page by invoking "deletePostCallback()"', () => {
        beforeEach(async () => {
          wrapper = await Wrapper()
          await wrapper.vm.deletePostCallback()
        })

        describe('after timeout', () => {
          beforeEach(jest.runAllTimers)

          it('does call mutation', () => {
            expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
          })

          it('mutation is successful', () => {
            expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
          })

          it('does go to index (main) page', () => {
            expect(mocks.$router.history.push).toHaveBeenCalledTimes(1)
          })
        })
      })
    })

    describe('reply method called when emitted reply received', () => {
      it('CommentList', async () => {
        wrapper = await Wrapper()
        wrapper.find(CommentList).vm.$emit('reply', {
          id: 'commentAuthorId',
          slug: 'ogerly',
        })
        expect(stubs.HcEditor.methods.insertReply).toHaveBeenCalledWith({
          id: 'commentAuthorId',
          slug: 'ogerly',
        })
      })
    })
  })
})
