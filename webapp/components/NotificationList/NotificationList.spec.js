import { config, shallowMount, mount, RouterLinkStub } from '@vue/test-utils'
import NotificationList from './NotificationList'
import Notification from '../Notification/Notification'
import Vuex from 'vuex'

import { testNotifications } from '~/components/utils/Notifications'

const localVue = global.localVue

localVue.filter('truncate', (string) => string)

config.stubs['client-only'] = '<span><slot /></span>'
config.stubs['v-popover'] = '<span><slot /></span>'

describe('NotificationList.vue', () => {
  let wrapper
  let mocks
  let stubs
  let store
  let propsData

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        'auth/isModerator': () => false,
        'auth/user': () => {
          return {}
        },
      },
    })
    mocks = {
      $t: jest.fn(),
      $i18n: {
        locale: () => 'en',
      },
    }
    stubs = {
      NuxtLink: RouterLinkStub,
    }
    propsData = { notifications: testNotifications }
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      return shallowMount(NotificationList, {
        propsData,
        mocks,
        store,
        localVue,
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('renders Notification.vue for each notification of the user', () => {
      expect(wrapper.findAll(Notification)).toHaveLength(5)
    })
  })

  describe('mount', () => {
    const Wrapper = () => {
      return mount(NotificationList, {
        propsData,
        mocks,
        stubs,
        store,
        localVue,
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe("emit 'read' like as clicked on a notification", () => {
      beforeEach(() => {
        wrapper.find(Notification).vm.$emit('read')
      })

      it("emits 'markAsRead' with the id of the notification source if 'read' was emited", () => {
        expect(wrapper.emitted('markAsRead')[0]).toEqual(['post-1'])
      })
    })
  })
})
