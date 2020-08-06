import { config, mount } from '@vue/test-utils'
import CommentList from './CommentList'
import CommentCard from '~/components/CommentCard/CommentCard'
import Vuex from 'vuex'
import Vue from 'vue'

const localVue = global.localVue

localVue.filter('truncate', (string) => string)
localVue.directive('scrollTo', jest.fn())

config.stubs['v-popover'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'
config.stubs['client-only'] = '<span><slot /></span>'

describe('CommentList.vue', () => {
  let mocks, store, wrapper, propsData, stubs

  describe('mount', () => {
    beforeEach(() => {
      propsData = {
        post: {
          id: 'post42',
          comments: [
            {
              id: 'comment134',
              contentExcerpt: 'this is a comment',
              content: 'this is a comment',
              author: { id: 'some-user' },
            },
            {
              id: 'comment135',
              contentExcerpt: 'this is a deleted comment',
              content: 'this is a deleted comment',
              deleted: true,
              author: { id: 'some-user' },
            },
            {
              id: 'comment136',
              contentExcerpt: 'this is a disabled comment',
              content: 'this is a disabled comment',
              disabled: true,
              author: { id: 'some-user' },
            },
          ],
        },
      }
      store = new Vuex.Store({
        getters: {
          'auth/isModerator': () => false,
          'auth/user': () => {
            return {}
          },
        },
      })
      mocks = {
        $t: jest.fn(),
        $filters: {
          truncate: (a) => a,
          removeHtml: (a) => a,
        },
        $scrollTo: jest.fn(),
        $route: { hash: '' },
        $apollo: {
          queries: {
            Post: {
              refetch: jest.fn(),
            },
          },
        },
      }
      stubs = {
        EditorContent: "<div class='stub'></div>",
      }
    })

    const Wrapper = () => {
      return mount(CommentList, {
        store,
        mocks,
        localVue,
        propsData,
        stubs,
      })
    }

    it('displays a comments counter that ignores disabled and deleted comments', () => {
      wrapper = Wrapper()
      expect(wrapper.find('.count').text()).toEqual('1')
    })

    describe('scrollToAnchor mixin', () => {
      beforeEach(jest.useFakeTimers)

      describe('$route.hash !== `#comments`', () => {
        it('skips $scrollTo', () => {
          wrapper = Wrapper()
          jest.runAllTimers()
          expect(mocks.$scrollTo).not.toHaveBeenCalled()
        })
      })

      describe('$route.hash === `#comments`', () => {
        beforeEach(() => {
          mocks.$route = {
            hash: '#comments',
          }
        })

        it('calls $scrollTo', () => {
          wrapper = Wrapper()
          jest.runAllTimers()
          expect(mocks.$scrollTo).toHaveBeenCalledWith('#comments')
        })
      })
    })

    describe('Comment', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      it('Comment emitted reply()', () => {
        wrapper.find(CommentCard).vm.$emit('reply', {
          id: 'commentAuthorId',
          slug: 'ogerly',
        })
        Vue.nextTick()
        expect(wrapper.emitted('reply')).toEqual([
          [
            {
              id: 'commentAuthorId',
              slug: 'ogerly',
            },
          ],
        ])
      })
    })
  })
})
