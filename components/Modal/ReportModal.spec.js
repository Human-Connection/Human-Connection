import { shallowMount, render, mount, createLocalVue } from '@vue/test-utils'
import ReportModal from './ReportModal.vue'
import Vue from 'vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('ReportModal.vue', () => {
  let wrapper
  let Wrapper
  let propsData
  let mocks

  beforeEach(() => {
    propsData = {}
    mocks = {
      $t: jest.fn(),
      $filters: {
        truncate: a => a
      },
      $toast: {
        success: () => {},
        error: () => {}
      },
      $apollo: {
        mutate: jest.fn().mockResolvedValue()
      }
    }
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      return shallowMount(ReportModal, { propsData, mocks, localVue })
    }

    describe('defaults', () => {
      it('isOpen false', () => {
        expect(Wrapper().vm.isOpen).toBe(false)
      })

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
          resource: {
            type: 'user',
            name: 'Bob Ross'
          }
        }
      })

      it('mentions user name', () => {
        Wrapper()
        const calls = mocks.$t.mock.calls
        const expected = [['report.user.message', { name: 'Bob Ross' }]]
        expect(calls).toEqual(expect.arrayContaining(expected))
      })
    })
  })

  describe('mount', () => {
    const Wrapper = () => {
      return mount(ReportModal, { propsData, mocks, localVue })
    }

    it('renders', () => {
      expect(Wrapper().is('div')).toBe(true)
    })

    describe('given id and opened', () => {
      beforeEach(() => {
        propsData = {
          isOpen: true,
          resource: {
            id: 4711
          }
        }
        wrapper = Wrapper()
      })

      describe('click cancel button', () => {
        beforeEach(() => {
          wrapper = Wrapper()
          wrapper.find('button.cancel').trigger('click')
        })

        it('emits close', () => {
          expect(wrapper.emitted().close).toBeTruthy()
        })

        it('does not call mutation', () => {
          expect(mocks.$apollo.mutate).not.toHaveBeenCalled()
        })
      })

      describe('click confirm button', () => {
        beforeEach(() => {
          jest.useFakeTimers()
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
