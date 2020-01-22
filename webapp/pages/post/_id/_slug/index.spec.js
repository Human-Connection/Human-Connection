import { config, mount } from '@vue/test-utils'
import PostSlug from './index.vue'
import Vuex from 'vuex'
import Vue from 'vue'

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'
config.stubs['router-link'] = '<span><slot /></span>'

const localVue = global.localVue

describe('PostSlug', () => {
  let wrapper
  let Wrapper
  let store
  let mocks
  let propsData

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        'auth/user': () => {
          return { id: '1stUser' }
        },
        'auth/isModerator': () => false,
      },
    })
    propsData = {}
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
        query: jest.fn().mockResolvedValue(),
      },
      $scrollTo: jest.fn(),
    }
  })

  describe('mount', () => {
    Wrapper = () => {
      return mount(PostSlug, {
        store,
        mocks,
        localVue,
        propsData,
      })
    }

    describe('test Post callbacks', () => {
      beforeEach(() => {
        wrapper = Wrapper()
        // wrapper.setData({
        //   post: {
        //     id: 'p23',
        //     name: 'It is a post',
        //     author: {
        //       id: 'u1',
        //     },
        //   },
        // })
      })

      describe('deletion of Post from Page by invoking "deletePostCallback()"', () => {
        beforeEach(() => {
          wrapper.vm.deletePostCallback()
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

    describe('test Post callbacks', () => {
      beforeEach(() => {
        beforeEach(jest.useFakeTimers)
        wrapper = Wrapper()
      })
      it('CommentList', () => {
        wrapper.setData({
          post: {
            id: 1,
            author: {
              id: '1stUser',
            },
            comments: [
              {
                id: 'comment134',
                contentExcerpt: 'this is a comment',
                content: 'this is a comment',
                author: {
                  id: '1stUser',
                  slug: '1st-user',
                },
              },
            ],
          },
        })
        jest.runAllTimers()
        Vue.nextTick()
        const spy = jest.spyOn(wrapper.vm, 'reply')
        expect(spy).toBe(true)
      })
    })
  })
})
