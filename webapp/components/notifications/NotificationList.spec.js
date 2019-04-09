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
  let propsData
  let mocks
  let stubs
  let getters
  let actions
  let user

  beforeEach(() => {
    mocks = {
      $t: jest.fn()
    }
    stubs = {
      NuxtLink: RouterLinkStub
    }
    actions = {
      'notifications/markAsRead': jest.fn()
    }
    getters = {
      'auth/user': () => {
        return {
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
      }
    }
  })

  describe('shallowMount', () => {
    const Wrapper = () => {
      const store = new Vuex.Store({ getters, actions })
      return shallowMount(NotificationList, {
        store,
        propsData,
        mocks,
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
      const store = new Vuex.Store({ getters, actions })
      return mount(NotificationList, {
        store,
        propsData,
        mocks,
        stubs,
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

      it('marks notification as read', () => {
        expect(actions['notifications/markAsRead'].mock.calls[0][1]).toEqual(
          'notification-42'
        )
      })
    })
  })
})
