import { shallowMount, render, mount, createLocalVue } from '@vue/test-utils'
import ReportModal from './ReportModal.vue'
import Vue from 'vue'
import Vuex from 'vuex'
import { getters, mutations } from '../store/modal'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('ReportModal.vue', () => {
  let Wrapper
  let store
  let state
  let mocks
  let $apollo

  beforeEach(() => {
    $apollo = {
      mutate: jest.fn().mockResolvedValue(null)
    }
    state = {
      open: 'report',
      data: {}
    }
  })

  describe('mount', () => {
    const Wrapper = () => {
      mocks = {
        $t: () => {},
        $toast: {
          success: () => {},
          error: () => {}
        },
        $apollo
      }
      store = new Vuex.Store({
        state,
        getters: {
          'modal/open': getters.open,
          'modal/data': getters.data
        },
        mutations: {
          'modal/SET_OPEN': mutations.SET_OPEN
        }
      })
      return mount(ReportModal, { store, mocks, localVue })
    }

    it('renders', () => {
      expect(Wrapper().is('div')).toBe(true)
    })

    describe('modal visible', () => {
      describe('shows a report', () => {
        let wrapper
        beforeEach(() => {
          state = {
            open: 'report',
            data: {}
          }
          wrapper = Wrapper()
        })

        describe('click confirm button', () => {
          const clickAction = async () => {
            const confirmButton = wrapper.find('.ds-button-danger')
            await confirmButton.trigger('click')
          }

          it('calls report mutation', async () => {
            await clickAction()
            expect($apollo.mutate).toHaveBeenCalled()
          })

          it('hides modal', async () => {
            expect(wrapper.find('.ds-modal-wrapper').isEmpty()).toEqual(false)
            await clickAction()
            expect(wrapper.find('.ds-modal-wrapper').isEmpty()).toEqual(true)
          })

          it('disables buttons', async () => {
            const expected = { disabled: 'disabled' }
            let cancelButton = wrapper.findAll('footer button').at(0)
            let confirmButton = wrapper.findAll('footer button').at(1)
            expect(cancelButton.attributes()).toEqual(
              expect.not.objectContaining(expected)
            )
            expect(confirmButton.attributes()).toEqual(
              expect.not.objectContaining(expected)
            )
            await clickAction()
            expect(cancelButton.attributes()).toEqual(
              expect.objectContaining(expected)
            )
            expect(confirmButton.attributes()).toEqual(
              expect.objectContaining(expected)
            )
          })
        })
      })
    })
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      mocks = {
        $t: () => {},
        $apollo
      }
      store = new Vuex.Store({})
      return shallowMount(ReportModal, { store, mocks, localVue })
    }

    describe('isOpen', () => {
      it('defaults to false', () => {
        expect(Wrapper().vm.isOpen).toBe(false)
      })
    })
  })
})
