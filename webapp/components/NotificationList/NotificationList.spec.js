import { config, shallowMount, mount, RouterLinkStub } from '@vue/test-utils'
import NotificationList from './NotificationList'
import Notification from '../Notification/Notification'
import Vuex from 'vuex'

export const notifications = [
  {
    read: false,
    reason: 'mentioned_in_post',
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
    reason: 'mentioned_in_comment',
    from: {
      __typename: 'Comment',
      id: 'comment-2',
      contentExcerpt: 'this is yet another post content',
      post: {
        id: 'post-1',
        title: 'some post on a comment',
        slug: 'some-post-on-a-comment',
        contentExcerpt: 'this is a post content',
        author: {
          id: 'john-1',
          slug: 'john-doe',
          name: 'John Doe',
        },
      },
      author: {
        id: 'jane-1',
        slug: 'jane-doe',
        name: 'Jane Doe',
      },
    },
  },
]

const localVue = global.localVue

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
    propsData = { notifications }
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
        wrapper.find('.notification-mention-post').trigger('click')
      })

      it("emits 'markAsRead' with the id of the notification source", () => {
        expect(wrapper.emitted('markAsRead')[0]).toEqual(['post-1'])
      })
    })
  })
})
