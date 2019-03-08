import { shallowMount, render, mount, createLocalVue } from '@vue/test-utils'
import ReportModal from './ReportModal.vue'
import ModalTestbed from './ModalTestbed.vue'
import Vue from 'vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import portal from 'portal-vue'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(portal)

describe('ReportModal.vue', () => {
  let Wrapper
  let getters
  let store
  let mocks
  let $apollo

  beforeEach(() => {
    getters = {
      'modal/data': () => {
        return {
          success: false,
          loading: false,
          disabled: false
        }
      }
    }
    $apollo = {
      mutate: jest.fn().mockResolvedValue(null)
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
        getters
      })
      return mount(ModalTestbed, { store, mocks, localVue })
    }

    it('renders', () => {
      expect(Wrapper().is('div')).toBe(true)
    })

    describe('modal visible', () => {
      describe('shows a report', () => {
        beforeEach(() => {
          getters['modal/open'] = () => 'report'
        })

        describe('click confirm button', () => {
          let wrapper

          beforeEach(() => {
            wrapper = Wrapper()
            const confirmButton = wrapper.find('.ds-button-danger')
            confirmButton.trigger('click')
          })

          it('calls report mutation', () => {
            expect($apollo.mutate).toHaveBeenCalled()
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
      store = new Vuex.Store({
        getters
      })
      return shallowMount(ReportModal, { store, mocks, localVue })
    }

    describe('isOpen', () => {
      it('defaults to false', () => {
        expect(Wrapper().vm.isOpen).toBe(false)
      })
    })
  })
})
