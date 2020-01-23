import { config, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import PostSlug from './index.vue'
import CommentList from '~/components/CommentList/CommentList'

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'
config.stubs['router-link'] = '<span><slot /></span>'

const localVue = global.localVue
localVue.directive('scrollTo', jest.fn())

describe('PostSlug', () => {
  let store, propsData, mocks, stubs, wrapper, Wrapper, spy

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
        query: jest.fn().mockResolvedValue({ data: { PostEmotionsCountByEmotion: {} } }),
      },
      $scrollTo: jest.fn(),
      $refs: {
        editor: {
          insertReply: jest.fn(),
        },
        commentForm: {
          reply: jest.fn(),
        },
      },
    }
    stubs = {
      HcEditor: { render: () => {}, methods: { insertReply: () => null } },
      ContentViewer: true,
    }
    jest.useFakeTimers()
    wrapper = Wrapper()
    wrapper.setData({
      post: {
        id: '1',
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
      ready: true,
    })
    spy = jest.spyOn(wrapper.vm, 'reply')
  })

  describe('mount', () => {
    Wrapper = () => {
      return mount(PostSlug, {
        store,
        mocks,
        localVue,
        propsData,
        stubs,
      })
    }

    describe('test Post callbacks', () => {
      describe('deletion of Post from Page by invoking "deletePostCallback()"', () => {
        beforeEach(async () => {
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
        wrapper.find(CommentList).vm.$emit('reply', {
          id: 'commentAuthorId',
          slug: 'ogerly',
        })
        expect(spy).toHaveBeenCalledTimes(1)
      })
    })
  })
})
