import { config, mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'
import User from './User.vue'
import Vue from 'vue'
import Vuex from 'vuex'
import VTooltip from 'v-tooltip'

import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()
const filter = jest.fn(str => str)

localVue.use(Vuex)
localVue.use(VTooltip)
localVue.use(Styleguide)

localVue.filter('truncate', filter)

describe('User.vue', () => {
  let wrapper
  let Wrapper
  let propsData
  let mocks
  let stubs
  let getters
  let user

  beforeEach(() => {
    propsData = {}

    mocks = {
      $t: jest.fn()
    }
    stubs = {
      NuxtLink: RouterLinkStub
    }
    getters = {
      'auth/user': () => {
        return {}
      },
      'auth/isModerator': () => false
    }
  })

  describe('mount', () => {
    const Wrapper = () => {
      const store = new Vuex.Store({
        getters
      })
      return mount(User, { store, propsData, mocks, stubs, localVue })
    }

    it('renders anonymous user', () => {
      const wrapper = Wrapper()
      expect(wrapper.text()).not.toMatch('Tilda Swinton')
      expect(wrapper.text()).toMatch('Anonymus')
    })

    describe('given an user', () => {
      beforeEach(() => {
        propsData.user = {
          name: 'Tilda Swinton',
          slug: 'tilda-swinton'
        }
      })

      it('renders user name', () => {
        const wrapper = Wrapper()
        expect(wrapper.text()).not.toMatch('Anonymous')
        expect(wrapper.text()).toMatch('Tilda Swinton')
      })

      describe('user is disabled', () => {
        beforeEach(() => {
          propsData.user.disabled = true
        })

        it('renders anonymous user', () => {
          const wrapper = Wrapper()
          expect(wrapper.text()).not.toMatch('Tilda Swinton')
          expect(wrapper.text()).toMatch('Anonymus')
        })

        describe('current user is a moderator', () => {
          beforeEach(() => {
            getters['auth/isModerator'] = () => true
          })

          it('renders user name', () => {
            const wrapper = Wrapper()
            expect(wrapper.text()).not.toMatch('Anonymous')
            expect(wrapper.text()).toMatch('Tilda Swinton')
          })

          it('has "disabled-content" class', () => {
            const wrapper = Wrapper()
            expect(wrapper.classes()).toContain('disabled-content')
          })
        })
      })
    })
  })
})
