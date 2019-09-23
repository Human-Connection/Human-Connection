import { config, shallowMount, createLocalVue } from '@vue/test-utils'
import Comment from './Comment.vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

config.stubs['client-only'] = '<span><slot /></span>'

describe('Comment.vue', () => {
  let propsData
  let mocks
  let getters
  let wrapper
  let Wrapper

  beforeEach(() => {
    propsData = {}
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
        truncate: a => a,
        removeHtml: a => a,
      },
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
    getters = {
      'auth/user': () => {
        return {}
      },
      'auth/isModerator': () => false,
    }
  })

  describe('shallowMount', () => {
    Wrapper = () => {
      const store = new Vuex.Store({
        getters,
      })
      return shallowMount(Comment, {
        store,
        propsData,
        mocks,
        localVue,
      })
    }

    describe('given a comment', () => {
      beforeEach(() => {
        propsData.comment = {
          id: '2',
          contentExcerpt: 'Hello I am a comment content',
          content: 'Hello I am comment content',
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

      beforeEach(jest.useFakeTimers)

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
    })
  })
})
