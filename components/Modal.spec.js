import { mount, createLocalVue } from '@vue/test-utils'
import Modal from './Modal.vue'
import Vue from 'vue'
import Vuex from 'vuex'
import { getters, mutations } from '../store/modal'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('Modal.vue', () => {
  let Wrapper
  let store
  let state
  let mocks

  beforeEach(() => {
    mocks = {
      $t: () => {}
    }
    state = {
      open: null,
      data: {}
    }
  })

  describe('mount', () => {
    let wrapper
    const Wrapper = () => {
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
      return mount(Modal, { store, mocks, localVue })
    }

    it('renders nothing', () => {
      wrapper = Wrapper()
      expect(wrapper.isEmpty()).toBe(true)
    })

    describe('store opens a report', () => {
      beforeEach(() => {
        state = {
          open: 'report',
          data: {}
        }
        wrapper = Wrapper()
      })

      it('renders report modal', () => {
        expect(wrapper.contains('#modal-report')).toBe(true)
      })
    })
  })
})
