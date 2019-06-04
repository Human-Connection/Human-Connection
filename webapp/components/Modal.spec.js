import { shallowMount, createLocalVue } from '@vue/test-utils'
import Modal from './Modal.vue'
import DeleteModal from './Modal/DeleteModal.vue'
import DisableModal from './Modal/DisableModal.vue'
import ReportModal from './Modal/ReportModal.vue'
import Vuex from 'vuex'
import { getters, mutations } from '../store/modal'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('Modal.vue', () => {
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
          'modal/data': getters.data,
        },
        mutations: {
          'modal/SET_OPEN': mutations.SET_OPEN,
        },
      })
      return mountMethod(Modal, {
        store,
        mocks,
        localVue,
      })
    }
  }

  beforeEach(() => {
    mocks = {
      $filters: {
        truncate: a => a,
      },
      $toast: {
        success: () => {},
        error: () => {},
      },
      $t: () => {},
    }
    state = {
      open: null,
      data: {},
    }
  })

  describe('shallowMount', () => {
    const Wrapper = createWrapper(shallowMount)

    it('initially empty', () => {
      wrapper = Wrapper()
      expect(wrapper.contains(DeleteModal)).toBe(false)
      expect(wrapper.contains(DisableModal)).toBe(false)
      expect(wrapper.contains(ReportModal)).toBe(false)
    })

    describe('store/modal holds data to disable', () => {
      beforeEach(() => {
        state = {
          open: 'disable',
          data: {
            type: 'contribution',
            resource: {
              id: 'c456',
              title: 'some title',
            },
            callbacks: {
              confirm: null,
              cancel: null,
            },
          },
        }
        wrapper = Wrapper()
      })

      it('renders disable modal', () => {
        expect(wrapper.contains(DisableModal)).toBe(true)
      })

      it('passes data to disable modal', () => {
        expect(wrapper.find(DisableModal).props()).toEqual({
          type: 'contribution',
          name: 'some title',
          id: 'c456',
          callbacks: {
            confirm: null,
            cancel: null,
          },
        })
      })

      describe('child component emits close', () => {
        it('turns empty', () => {
          wrapper.find(DisableModal).vm.$emit('close')
          expect(wrapper.contains(DisableModal)).toBe(false)
        })
      })

      describe('store/modal data contains a comment', () => {
        it('passes author name to disable modal', () => {
          state.data = {
            type: 'comment',
            resource: {
              id: 'c456',
              author: {
                name: 'Author name',
              },
            },
            callbacks: {
              confirm: null,
              cancel: null,
            },
          }
          wrapper = Wrapper()
          expect(wrapper.find(DisableModal).props()).toEqual({
            type: 'comment',
            name: 'Author name',
            id: 'c456',
            callbacks: {
              confirm: null,
              cancel: null,
            },
          })
        })

        it('does not crash if author is undefined', () => {
          state.data = {
            type: 'comment',
            resource: {
              id: 'c456',
            },
            callbacks: {
              confirm: null,
              cancel: null,
            },
          }
          wrapper = Wrapper()
          expect(wrapper.find(DisableModal).props()).toEqual({
            type: 'comment',
            name: '',
            id: 'c456',
            callbacks: {
              confirm: null,
              cancel: null,
            },
          })
        })
      })
    })
  })
})
