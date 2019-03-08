import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import DisableModal from './DisableModal.vue'
import Vue from 'vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'
import portal from 'portal-vue'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(portal)

describe('DisableModal.vue', () => {
  let wrapper
  let getters
  let store
  let mocks

  beforeEach(() => {
    getters = {
      'modal/data': () => false
    }

    store = new Vuex.Store({
      getters
    })
    mocks = { $t: () => {} }
  })

  describe('mount', () => {
    beforeEach(() => {
      wrapper = mount(DisableModal, { store, mocks, localVue })
    })

    it('renders', () => {
      expect(wrapper.is('div')).toBe(true)
    })
  })

  describe('shallowMount', () => {
    beforeEach(() => {
      wrapper = shallowMount(DisableModal, { store, mocks, localVue })
    })
    describe('isOpen', () => {
      it('defaults to false', () => {
        expect(wrapper.vm.isOpen).toBe(false)
      })
    })
  })
})
