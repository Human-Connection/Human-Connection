import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import ConfirmModal from './ConfirmModal.vue'
import { postMenuModalsData } from '~/components/utils/PostHelpers'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('ConfirmModal.vue', () => {
  let Wrapper
  let wrapper
  let propsData
  let mocks
  const postName = 'It is a post'
  const confirmCallback = jest.fn()
  const cancelCallback = jest.fn()

  beforeEach(() => {
    propsData = {
      type: 'contribution',
      id: 'p23',
      name: postName,
      modalData: postMenuModalsData(postName, confirmCallback, cancelCallback).delete,
    }
    mocks = {
      $t: jest.fn(),
      $filters: {
        truncate: a => a,
      },
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('shallowMount', () => {
    Wrapper = () => {
      return shallowMount(ConfirmModal, {
        propsData,
        mocks,
        localVue,
      })
    }

    describe('defaults', () => {
      beforeEach(() => {
        wrapper = Wrapper()
      })
      it('isOpen true', () => {
        expect(wrapper.vm.isOpen).toBe(true)
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
          name: postName,
        }
        wrapper = Wrapper()
      })

      it('mentions post title', () => {
        const calls = mocks.$t.mock.calls
        const expected = [
          [
            'delete.contribution.message',
            {
              name: postName,
            },
          ],
        ]
        expect(calls).toEqual(expect.arrayContaining(expected))
      })
    })
  })

  describe('mount', () => {
    Wrapper = () => {
      return mount(ConfirmModal, {
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
            expect(cancelCallback).toHaveBeenCalledTimes(1)
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
            expect(confirmCallback).toHaveBeenCalledTimes(1)
          })

          it('emits "close"', () => {
            expect(wrapper.emitted().close).toHaveLength(1)
          })

          it('resets success', () => {
            expect(wrapper.vm.success).toBe(false)
          })
        })
      })
    })
  })
})
