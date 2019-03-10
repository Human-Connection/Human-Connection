import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
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
  let wrapper
  let store
  let state
  let mocks

  const createWrapper = mountMethod => {
    return () => {
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
      return mountMethod(Modal, { store, mocks, localVue })
    }
  }

  beforeEach(() => {
    mocks = {
      $filters: {
        truncate: a => a
      },
      $toast: {
        success: () => {},
        error: () => {}
      },
      $t: () => {}
    }
    state = {
      open: null,
      data: {}
    }
  })

  describe('shallowMount', () => {
    const Wrapper = createWrapper(shallowMount)

    it('renders nothing', () => {
      wrapper = Wrapper()
      expect(wrapper.isEmpty()).toBe(true)
    })

    describe('store state.open === "disable"', () => {
      beforeEach(() => {
        state = {
          open: 'disable',
          data: {}
        }
        wrapper = Wrapper()
      })

      it('renders report modal', () => {
        expect(wrapper.contains('disable-modal-stub')).toBe(true)
      })
    })
  })
})
