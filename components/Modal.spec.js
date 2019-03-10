import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import Modal from './Modal.vue'
import DisableModal from './Modal/DisableModal.vue'
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

    it('renders all modals as closed', () => {
      wrapper = Wrapper()
      expect(wrapper.find(DisableModal).vm.isOpen).toBe(false)
    })

    describe('store/modal holds data to disable', () => {
      beforeEach(() => {
        state = {
          open: 'disable',
          data: {
            type: 'contribution',
            name: 'some title',
            id: 456
          }
        }
        wrapper = Wrapper()
      })

      it('renders disable modal', () => {
        expect(wrapper.contains(DisableModal)).toBe(true)
      })

      it('passes data to disable modal', () => {
        expect(wrapper.find(DisableModal).props().resource).toEqual({
          type: 'contribution',
          name: 'some title',
          id: 456
        })
      })

      describe('child component emits close', () => {
        it('close DisableModal', () => {
          wrapper.find(DisableModal).vm.$emit('close')
          expect(wrapper.find(DisableModal).vm.isOpen).toBe(false)
        })
      })
    })
  })
})
