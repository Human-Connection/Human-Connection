import { config, shallowMount, mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'
import NotificationList from './NotificationList'
import Notification from '../Notification/Notification'
import Vuex from 'vuex'
import Filters from '~/plugins/vue-filters'

import Styleguide from '@human-connection/styleguide'

const localVue = createLocalVue()

localVue.use(Vuex)
localVue.use(Styleguide)
localVue.use(Filters)
localVue.filter('truncate', string => string)

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
    }
    stubs = {
      NuxtLink: RouterLinkStub,
    }
    propsData = {
      notifications: [
        {
          read: false,
          from: {
            __typename: 'Post',
            id: 'post-1',
            title: 'some post title',
            slug: 'some-post-title',
            contentExcerpt: 'this is a post content',
            author: {
              id: 'john-1',
              slug: 'john-doe',
              name: 'John Doe',
            },
          },
        },
        {
          read: false,
          from: {
            __typename: 'Post',
            id: 'post-2',
            title: 'another post title',
            slug: 'another-post-title',
            contentExcerpt: 'this is yet another post content',
            author: {
              id: 'john-1',
              slug: 'john-doe',
              name: 'John Doe',
            },
          },
        },
      ],
    }
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
        localVue,
      })
    }

    beforeEach(() => {
      wrapper = Wrapper()
    })

    describe('click on a notification', () => {
      beforeEach(() => {
        wrapper
          .findAll('.notification-mention-post')
          .at(1)
          .trigger('click')
      })

      it("emits 'markAsRead' with the id of the notification source", () => {
        expect(wrapper.emitted('markAsRead')).toBeTruthy()
        expect(wrapper.emitted('markAsRead')[0]).toEqual(['post-2'])
      })
    })
  })
})
