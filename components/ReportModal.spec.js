import { shallowMount, render, mount, createLocalVue } from '@vue/test-utils'
import ReportModal from './ReportModal.vue'
import ModalTestbed from './ModalTestbed.vue'
import Vue from 'vue'
import Vuex from 'vuex'
import { getters, mutations } from '../store/modal'
import Styleguide from '@human-connection/styleguide'
import portal from 'portal-vue'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(portal)

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
      return mount(ModalTestbed, { store, mocks, localVue })
    }

    beforeEach(() => {
      // TODO find out why on earth do we have to call Wrapper() at least twice?
      // TODO this is a nasty side effect and we have non-atomic tests here
      Wrapper()
    })

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

        describe('by default', () => {
          it('buttons enabled', () => {
            const expected = { disabled: 'disabled' }
            const cancelButton = wrapper.findAll('#portal footer button').at(0)
            const confirmButton = wrapper.findAll('#portal footer button').at(1)
            expect(cancelButton.attributes().disabled).toBeUndefined()
            expect(confirmButton.attributes().disabled).toBeUndefined()
          })
        })

        describe('click confirm button', () => {
          const clickAction = () => {
            const confirmButton = wrapper.find('.ds-button-danger')
            confirmButton.trigger('click')
          }

          it('calls report mutation', () => {
            clickAction()
            expect($apollo.mutate).toHaveBeenCalled()
          })

          it.todo('hides modal')

          it('disables buttons', () => {
            const expected = { disabled: 'disabled' }
            // TODO: `wrapper.findAll` behaves in a very odd way
            // if I call find or findAll first to check the initial attributes
            // the attributes won't change anymore. Seems to be a caching
            // problem here.  I made a workaround by checking the inital
            // in a separate test case above.
            clickAction()
            const cancelButton = wrapper.findAll('#portal footer button').at(0)
            const confirmButton = wrapper.findAll('#portal footer button').at(1)
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
