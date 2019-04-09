import {
  config,
  shallowMount,
  mount,
  createLocalVue,
  RouterLinkStub
} from '@vue/test-utils'
import NotificationList from './NotificationList.vue'
import Notification from './Notification.vue'
import Vue from 'vue'
import Vuex from 'vuex'

import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.filter('truncate', string => string)

config.stubs['no-ssr'] = '<span><slot /></span>'
config.stubs['v-popover'] = '<span><slot /></span>'

describe('NotificationList.vue', () => {
  let wrapper
  let Wrapper
  let mocks
  let stubs
  let user
  let store
  let propsData

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        'auth/user': () => {
          return {}
        }
      }
    })
    mocks = {
      $t: jest.fn()
    }
    stubs = {
      NuxtLink: RouterLinkStub
    }
    propsData = {
      notifications: [
        {
          id: 'notification-41',
          read: false,
          post: {
            id: 'post-1',
            title: 'some post title',
            contentExcerpt: 'this is a post content',
            author: {
              id: 'john-1',
              slug: 'john-doe',
              name: 'John Doe'
            }
          }
        },
        {
          id: 'notification-42',
          read: false,
          post: {
            id: 'post-2',
            title: 'another post title',
            contentExcerpt: 'this is yet another post content',
            author: {
              id: 'john-1',
              slug: 'john-doe',
              name: 'John Doe'
            }
          }
        }
      ]
    }
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      return shallowMount(NotificationList, {
        propsData,
        mocks,
        store,
        localVue
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    it('renders Notification.vue for each notification of the user', () => {
      expect(wrapper.findAll(Notification)).toHaveLength(2)
    })
  })

  describe('mount', () => {
    const Wrapper = () => {
      return mount(NotificationList, {
        propsData,
        mocks,
        stubs,
        store,
        localVue
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe('click on a notification', () => {
      beforeEach(() => {
        wrapper
          .findAll(Notification)
          .at(1)
          .trigger('click')
      })

      it("emits 'markAsRead' with the notificationId", () => {
        expect(wrapper.emitted('markAsRead')).toBeTruthy()
        expect(wrapper.emitted('markAsRead')[0]).toEqual(['notification-42'])
      })
    })
  })
})
