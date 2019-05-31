import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import DeleteModal from './DeleteModal.vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('DeleteModal.vue', () => {
  let Wrapper
  let wrapper
  let propsData
  let mocks

  beforeEach(() => {
    propsData = {
      type: 'contribution',
      id: 'p23',
      name: 'It is a post',
      callbacks: {
        confirm: jest.fn(),
        cancel: jest.fn(),
      },
    }
    mocks = {
      $t: jest.fn(),
      $filters: {
        truncate: a => a,
      },
    }
  })

  describe('shallowMount', () => {
    Wrapper = () => {
      return shallowMount(DeleteModal, {
        propsData,
        mocks,
        localVue,
      })
    }

    describe('defaults', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      it('success false', () => {
        expect(wrapper.vm.success).toBe(false)
      })

      it('loading false', () => {
        expect(wrapper.vm.loading).toBe(false)
      })
    })

    describe('given a post', () => {
      beforeEach(() => {
        propsData = {
          ...propsData,
          type: 'contribution',
          id: 'p23',
          name: 'It is a post',
        }
        wrapper = Wrapper()
      })

      it('mentions post title', () => {
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
          ...propsData,
          type: 'comment',
          id: 'c4',
          name: 'It is the user of the comment',
        }
        wrapper = Wrapper()
      })

      it('mentions comments user name', () => {
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
      })
    }

    beforeEach(jest.useFakeTimers)

    describe('given post id', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })

      describe('click cancel button', () => {
        beforeEach(() => {
          wrapper.find('button.cancel').trigger('click')
        })

        describe('after timeout', () => {
          beforeEach(jest.runAllTimers)

          it('fades away', () => {
            expect(wrapper.vm.isOpen).toBe(false)
          })

          it('does call the cancel callback', () => {
            expect(propsData.callbacks.cancel).toHaveBeenCalledTimes(1)
          })

          it('emits "close"', () => {
            expect(wrapper.emitted().close).toBeTruthy()
          })
        })
      })

      describe('click confirm button', () => {
        beforeEach(() => {
          wrapper.find('button.confirm').trigger('click')
        })

        it('sets success', () => {
          expect(wrapper.vm.success).toBe(true)
        })

        describe('after timeout', () => {
          beforeEach(jest.runAllTimers)

          it('fades away', () => {
            expect(wrapper.vm.isOpen).toBe(false)
          })

          it('does call the confirm callback', () => {
            expect(propsData.callbacks.confirm).toHaveBeenCalledTimes(1)
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
  })
})
