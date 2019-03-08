import { shallowMount, render, mount, createLocalVue } from '@vue/test-utils'
import ReportModal from './ReportModal.vue'
import Vue from 'vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import portal from 'portal-vue'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(portal)

describe('ReportModal.vue', () => {
  let wrapper
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
      mutate: jest.fn()
    }
  })

  describe('mount', () => {
    const wrapper = () => {
      mocks = {
        $t: () => {},
        $apollo
      }
      store = new Vuex.Store({
        getters
      })
      return mount(ReportModal, { store, mocks, localVue })
    }

    it('renders', () => {
      expect(wrapper().is('div')).toBe(true)
    })

    describe('when open', () => {
      beforeEach(() => {
        getters['modal/open'] = () => 'report'
      })

      describe('confirm', () => {
        it('calls a mutation', () => {
          console.log(wrapper().html())
          const confirmButton = wrapper().find('.ds-button-danger')
          confirmButton.trigger('click')
          expect($apollo.mutate).toHaveBeenCalled()
        })
      })
    })
  })

  describe('shallowMount', () => {
    const wrapper = () => {
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
        expect(wrapper().vm.isOpen).toBe(false)
      })
    })
  })
})
