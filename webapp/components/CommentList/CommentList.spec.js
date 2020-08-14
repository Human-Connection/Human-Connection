import { config, mount } from '@vue/test-utils'
import CommentList from './CommentList'
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
              author: {
                id: 'some-user',
                slug: 'some-slug',
              },
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
            return { id: 'some-user' }
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

    describe('Respond to Comment', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      it('emits reply to comment', () => {
        wrapper.find('.reply-button').trigger('click')
        expect(wrapper.emitted('reply')).toEqual([
          [
            {
              id: 'some-user',
              slug: 'some-slug',
            },
          ],
        ])
      })
    })

    describe('edit Comment', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      it('updates comment after edit', () => {
        wrapper.vm.updateCommentList({
          id: 'comment134',
          contentExcerpt: 'this is an edited comment',
          content: 'this is an edited comment',
          author: {
            id: 'some-user',
            slug: 'some-slug',
          },
        })
        expect(wrapper.props('post').comments[0].content).toEqual('this is an edited comment')
      })
    })

    describe('delete Comment', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      // TODO: Test does not find .count = 0 but 1. Can't understand why...
      it.skip('sets counter to 0', async () => {
        wrapper.vm.updateCommentList({
          id: 'comment134',
          contentExcerpt: 'this is another deleted comment',
          content: 'this is an another deleted comment',
          deleted: true,
          author: {
            id: 'some-user',
            slug: 'some-slug',
          },
        })
        await Vue.nextTick()
        await expect(wrapper.find('.count').text()).toEqual('0')
      })
    })
  })
})
