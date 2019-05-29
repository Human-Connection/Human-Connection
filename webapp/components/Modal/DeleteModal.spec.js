import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
// import PostMutationHelpers from '~/mixins/PostMutationHelpers'
import DeleteModal from './DeleteModal.vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import VueRouter from 'vue-router'

const routes = [
  {
    path: '/',
  },
]
const router = new VueRouter({
  routes,
})
const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(VueRouter)

describe('DeleteModal.vue', () => {
  let Wrapper
  let wrapper
  let propsData
  let mocks

  beforeEach(() => {
    propsData = {
      type: 'contribution',
      id: 'p23',
      // callbacks: {
      //   confirm: () => Post.methods.deletePostCallback('list'),
      //   cancel: null,
      // },
    }
    mocks = {
      $t: jest.fn(),
      $filters: {
        truncate: a => a,
      },
      $toast: {
        success: () => {},
        error: () => {},
      },
      $apollo: {
        mutate: jest.fn().mockResolvedValue(),
      },
    }
  })

  describe('shallowMount', () => {
    Wrapper = () => {
      return shallowMount(DeleteModal, {
        propsData,
        mocks,
        localVue,
        router,
      })
    }

    describe('defaults', () => {
      it('success false', () => {
        expect(Wrapper().vm.success).toBe(false)
      })

      it('loading false', () => {
        expect(Wrapper().vm.loading).toBe(false)
      })
    })

    describe('given a post', () => {
      beforeEach(() => {
        propsData = {
          type: 'contribution',
          id: 'p23',
          name: 'It is a post',
          // callbacks: {
          //   confirm: () => Post.methods.deletePostCallback('list'),
          //   cancel: null,
          // },
        }
      })

      it('mentions post title', () => {
        Wrapper()
        const calls = mocks.$t.mock.calls
        const expected = [
          [
            'delete.contribution.message',
            {
              name: 'It is a post',
            },
          ],
        ]
        expect(calls).toEqual(expect.arrayContaining(expected))
      })
    })

    describe('given a comment', () => {
      beforeEach(() => {
        propsData = {
          type: 'comment',
          id: 'c3',
          name: 'It is the user of the comment',
          // callbacks: {
          //   confirm: () => Post.methods.deletePostCallback('list'),
          //   cancel: null,
          // },
        }
      })

      it('mentions comments user name', () => {
        Wrapper()
        const calls = mocks.$t.mock.calls
        const expected = [
          [
            'delete.comment.message',
            {
              name: 'It is the user of the comment',
            },
          ],
        ]
        expect(calls).toEqual(expect.arrayContaining(expected))
      })
    })
  })

  describe('mount', () => {
    Wrapper = () => {
      return mount(DeleteModal, {
        propsData,
        mocks,
        localVue,
        router,
      })
    }

    beforeEach(jest.useFakeTimers)

    it('renders', () => {
      expect(Wrapper().is('div')).toBe(true)
    })

    describe('given post id', () => {
      beforeEach(() => {
        propsData = {
          type: 'contribution',
          id: 'p23',
          // callbacks: {
          //   confirm: () => Post.methods.deletePostCallback('list'),
          //   cancel: null,
          // },
        }
        wrapper = Wrapper()
      })

      describe('click cancel button and do not delete the post', () => {
        beforeEach(() => {
          wrapper = Wrapper()
          wrapper.find('button.cancel').trigger('click')
        })

        describe('after timeout', () => {
          beforeEach(jest.runAllTimers)

          it('fades away', () => {
            expect(wrapper.vm.isOpen).toBe(false)
          })

          it('emits "close"', () => {
            expect(wrapper.emitted().close).toBeTruthy()
          })

          it('does not call mutation', () => {
            expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
          })
        })
      })

      describe('click confirm button and delete the post', () => {
        beforeEach(() => {
          wrapper.find('button.confirm').trigger('click')
        })

        it('calls delete mutation', () => {
          expect(mocks.$apollo.mutate).toHaveBeenCalled()
        })

        it('sets success', () => {
          expect(wrapper.vm.success).toBe(true)
        })

        it('displays a success message', () => {
          const calls = mocks.$t.mock.calls
          const expected = [['delete.contribution.success']]
          expect(calls).toEqual(expect.arrayContaining(expected))
        })

        describe('after timeout', () => {
          beforeEach(jest.runAllTimers)

          it('fades away', () => {
            expect(wrapper.vm.isOpen).toBe(false)
          })

          it('emits close', () => {
            expect(wrapper.emitted().close).toBeTruthy()
          })

          it('resets success', () => {
            expect(wrapper.vm.success).toBe(false)
          })
        })
      })
    })

    describe('given comment id', () => {
      beforeEach(() => {
        propsData = {
          type: 'comment',
          id: 'c3',
          // callbacks: {
          //   confirm: () => Post.methods.deletePostCallback('list'),
          //   cancel: null,
          // },
        }
        wrapper = Wrapper()
      })

      describe('click confirm button and delete the comment', () => {
        beforeEach(() => {
          wrapper.find('button.confirm').trigger('click')
        })

        it('calls delete mutation', () => {
          expect(mocks.$apollo.mutate).toHaveBeenCalled()
        })

        it('sets success', () => {
          expect(wrapper.vm.success).toBe(true)
        })

        it('displays a success message', () => {
          const calls = mocks.$t.mock.calls
          const expected = [['delete.comment.success']]
          expect(calls).toEqual(expect.arrayContaining(expected))
        })
      })
    })
  })
})
