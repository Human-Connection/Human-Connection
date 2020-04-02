import { config, mount } from '@vue/test-utils'
import CommentCard from './CommentCard.vue'
import Vuex from 'vuex'

const localVue = global.localVue
localVue.directive('scrollTo', jest.fn())

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['nuxt-link'] = '<span><slot /></span>'

describe('CommentCard.vue', () => {
  let propsData, mocks, stubs, getters, wrapper, Wrapper

  beforeEach(() => {
    propsData = {
      comment: {
        id: 'comment007',
        author: { id: 'some-user' },
      },
      postId: 'post42',
    }
    mocks = {
      $t: jest.fn(),
      $toast: {
        success: jest.fn(),
        error: jest.fn(),
      },
      $i18n: {
        locale: () => 'en',
      },
      $filters: {
        truncate: (a) => a,
        removeHtml: (a) => a,
      },
      $route: { hash: '' },
      $scrollTo: jest.fn(),
      $apollo: {
        mutate: jest.fn().mockResolvedValue({
          data: {
            DeleteComment: {
              id: 'it-is-the-deleted-comment',
            },
          },
        }),
      },
    }
    stubs = {
      ContentViewer: true,
    }
    getters = {
      'auth/user': () => {
        return {}
      },
      'auth/isModerator': () => false,
    }
  })

  describe('mount', () => {
    beforeEach(jest.useFakeTimers)

    Wrapper = () => {
      const store = new Vuex.Store({
        getters,
      })
      return mount(CommentCard, {
        store,
        propsData,
        mocks,
        localVue,
        stubs,
      })
    }

    describe('given a comment', () => {
      beforeEach(() => {
        propsData.comment = {
          id: '2',
          contentExcerpt: 'Hello I am a comment content',
          content: 'Hello I am comment content',
          author: { id: 'commentAuthorId', slug: 'ogerly' },
        }
      })

      // skipped for now because of the immense difficulty in testing tiptap editor
      it.skip('renders content', () => {
        wrapper = Wrapper()
        expect(wrapper.text()).toMatch('Hello I am a comment content')
      })

      describe('which is disabled', () => {
        beforeEach(() => {
          propsData.comment.disabled = true
        })

        it('renders no comment data', () => {
          wrapper = Wrapper()
          expect(wrapper.text()).not.toMatch('comment content')
        })

        it('has no "disabled-content" css class', () => {
          wrapper = Wrapper()
          expect(wrapper.classes()).not.toContain('disabled-content')
        })

        it('translates a placeholder', () => {
          wrapper = Wrapper()
          const calls = mocks.$t.mock.calls
          const expected = [['comment.content.unavailable-placeholder']]
          expect(calls).toEqual(expect.arrayContaining(expected))
        })

        describe('for a moderator', () => {
          beforeEach(() => {
            getters['auth/isModerator'] = () => true
          })

          it.skip('renders comment data', () => {
            wrapper = Wrapper()
            expect(wrapper.text()).toMatch('comment content')
          })

          it('has a "disabled-content" css class', () => {
            wrapper = Wrapper()
            expect(wrapper.classes()).toContain('disabled-content')
          })
        })
      })

      describe('scrollToAnchor mixin', () => {
        describe('$route.hash !== comment.id', () => {
          beforeEach(() => {
            mocks.$route = {
              hash: '',
            }
          })

          it('skips $scrollTo', () => {
            wrapper = Wrapper()
            jest.runAllTimers()
            expect(mocks.$scrollTo).not.toHaveBeenCalled()
          })
        })

        describe('$route.hash === comment.id', () => {
          beforeEach(() => {
            mocks.$route = {
              hash: '#commentId-2',
            }
          })

          it('calls $scrollTo', () => {
            wrapper = Wrapper()
            jest.runAllTimers()
            expect(mocks.$scrollTo).toHaveBeenCalledWith('#commentId-2')
          })
        })
      })

      describe('test callbacks', () => {
        beforeEach(() => {
          wrapper = Wrapper()
        })

        describe('deletion of Comment from List by invoking "deleteCommentCallback()"', () => {
          beforeEach(async () => {
            await wrapper.vm.deleteCommentCallback()
          })

          it('emits "deleteComment"', () => {
            expect(wrapper.emitted('deleteComment')).toEqual([
              [
                {
                  id: 'it-is-the-deleted-comment',
                },
              ],
            ])
          })

          it('does call mutation', () => {
            expect(mocks.$apollo.mutate).toHaveBeenCalledTimes(1)
          })

          it('mutation is successful', () => {
            expect(mocks.$toast.success).toHaveBeenCalledTimes(1)
          })
        })
      })

      describe('test update comment', () => {
        beforeEach(() => {
          wrapper = Wrapper()
        })

        describe('with a given comment', () => {
          beforeEach(async () => {
            await wrapper.vm.updateComment({
              id: 'it-is-the-updated-comment',
            })
          })

          it('emits "updateComment"', () => {
            expect(wrapper.emitted('updateComment')).toEqual([
              [
                {
                  id: 'it-is-the-updated-comment',
                },
              ],
            ])
          })
        })
      })

      describe('click reply button', () => {
        beforeEach(async () => {
          wrapper = Wrapper()
          await wrapper.find('.reply-button').trigger('click')
        })

        it('emits "reply"', () => {
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
})
