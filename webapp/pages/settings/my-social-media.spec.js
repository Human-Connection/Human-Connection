import { shallowMount, mount, createLocalVue } from '@vue/test-utils'
import MySocialMedia from './my-social-media.vue'
import Vue from 'vue'
import Vuex from 'vuex'
import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)

describe('my-social-media.vue', () => {
  let wrapper
  let Wrapper
  let store
  let mocks
  let getters

  beforeEach(() => {
    mocks = {
      $t: jest.fn()
    }
    getters = {
      'auth/user': () => {
        return {}
      }
    }
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      store = new Vuex.Store({
        getters
      })
      return shallowMount(MySocialMedia, { store, mocks, localVue })
    }

    it('renders', () => {
      wrapper = Wrapper()
      expect(wrapper.contains('div')).toBe(true)
    })

    describe('given currentUser has social media accounts', () => {
      beforeEach(() => {
        getters = {
          'auth/user': () => {
            return {
              socialMedia: [
                { id: 's1', url: 'https://freeradical.zone/@mattwr18' }
              ]
            }
          }
        }
      })

      it('renders', () => {
        wrapper = Wrapper()
        expect(wrapper.contains('div')).toBe(true)
      })
    })
  })
})
