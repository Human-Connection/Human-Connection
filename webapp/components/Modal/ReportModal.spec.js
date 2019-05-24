import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import ReportModal from './ReportModal.vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('ReportModal.vue', () => {
  let wrapper
  let propsData
  let mocks

  beforeEach(() => {
    propsData = {
      type: 'contribution',
      id: 'c43',
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
    const Wrapper = () => {
      return shallowMount(ReportModal, { propsData, mocks, localVue })
    }

    describe('defaults', () => {
      it('success false', () => {
        expect(Wrapper().vm.success).toBe(false)
      })

      it('loading false', () => {
        expect(Wrapper().vm.loading).toBe(false)
      })
    })

    describe('given a user', () => {
      beforeEach(() => {
        propsData = {
          type: 'user',
          id: 'u4',
          name: 'Bob Ross',
        }
      })

      it('mentions user name', () => {
        Wrapper()
        const calls = mocks.$t.mock.calls
        const expected = [['report.user.message', { name: 'Bob Ross' }]]
        expect(calls).toEqual(expect.arrayContaining(expected))
      })
    })

    describe('given a post', () => {
      beforeEach(() => {
        propsData = {
          id: 'p23',
          type: 'post',
          name: 'It is a post',
        }
      })

      it('mentions post title', () => {
        Wrapper()
        const calls = mocks.$t.mock.calls
        const expected = [['report.post.message', { name: 'It is a post' }]]
        expect(calls).toEqual(expect.arrayContaining(expected))
      })
    })
  })

  describe('mount', () => {
    const Wrapper = () => {
      return mount(ReportModal, { propsData, mocks, localVue })
    }

    beforeEach(jest.useFakeTimers)

    it('renders', () => {
      expect(Wrapper().is('div')).toBe(true)
    })

    describe('given id', () => {
      beforeEach(() => {
        propsData = {
          type: 'user',
          id: 'u4711',
        }
        wrapper = Wrapper()
      })

      describe('click cancel button', () => {
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

      describe('click confirm button', () => {
        beforeEach(() => {
          wrapper.find('button.confirm').trigger('click')
        })

        it('calls report mutation', () => {
          expect(mocks.$apollo.mutate).toHaveBeenCalled()
        })

        it('sets success', () => {
          expect(wrapper.vm.success).toBe(true)
        })

        it('displays a success message', () => {
          const calls = mocks.$t.mock.calls
          const expected = [['report.success']]
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
  })
})
